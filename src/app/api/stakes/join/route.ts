import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

// Join stake
export async function POST(request: NextRequest) {
  try {
    const { stake_id, user_id, amount } = await request.json()

    if (!stake_id || !user_id || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Stake ID, User ID, and amount are required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Check if stake exists and is active
      const stakeQuery = `
        SELECT s.*, g.id as group_id
        FROM stakes s
        JOIN groups g ON s.group_id = g.id
        WHERE s.id = $1 AND s.status = 'active' AND s.end_time > NOW()
      `
      const stakeResult = await client.query(stakeQuery, [stake_id])

      if (stakeResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Stake not found or not active'
        }, { status: 404 })
      }

      const stake = stakeResult.rows[0]

      // Verify user is a member of the group
      const memberCheck = await client.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [stake.group_id, user_id]
      )

      if (memberCheck.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'User is not a member of this group'
        }, { status: 403 })
      }

      // Check if user is already participating
      const participantCheck = await client.query(
        'SELECT id FROM stake_participants WHERE stake_id = $1 AND user_id = $2',
        [stake_id, user_id]
      )

      if (participantCheck.rows.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'User is already participating in this stake'
        }, { status: 400 })
      }

      // Add participant
      const participantQuery = `
        INSERT INTO stake_participants (stake_id, user_id, amount)
        VALUES ($1, $2, $3)
        RETURNING *
      `
      const participantResult = await client.query(participantQuery, [stake_id, user_id, amount])

      // Update total pool
      await client.query(
        'UPDATE stakes SET total_pool = total_pool + $1 WHERE id = $2',
        [amount, stake_id]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        data: participantResult.rows[0],
        message: 'Successfully joined stake'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Stake join error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to join stake',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Leave stake (only before start)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stakeId = searchParams.get('stakeId')
    const userId = searchParams.get('userId')

    if (!stakeId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Stake ID and User ID are required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Check if stake hasn't started yet
      const stakeQuery = `
        SELECT * FROM stakes 
        WHERE id = $1 AND start_time > NOW() AND status = 'active'
      `
      const stakeResult = await client.query(stakeQuery, [stakeId])

      if (stakeResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Cannot leave stake that has already started or is not active'
        }, { status: 400 })
      }

      // Get participant info
      const participantQuery = `
        SELECT * FROM stake_participants 
        WHERE stake_id = $1 AND user_id = $2
      `
      const participantResult = await client.query(participantQuery, [stakeId, userId])

      if (participantResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'User is not participating in this stake'
        }, { status: 400 })
      }

      const participant = participantResult.rows[0]

      // Remove participant
      await client.query(
        'DELETE FROM stake_participants WHERE stake_id = $1 AND user_id = $2',
        [stakeId, userId]
      )

      // Update total pool
      await client.query(
        'UPDATE stakes SET total_pool = total_pool - $1 WHERE id = $2',
        [participant.amount, stakeId]
      )

      // Check if this was the last participant (creator)
      const remainingParticipants = await client.query(
        'SELECT COUNT(*) as count FROM stake_participants WHERE stake_id = $1',
        [stakeId]
      )

      if (remainingParticipants.rows[0].count === '0') {
        // Cancel the stake if no participants left
        await client.query(
          "UPDATE stakes SET status = 'cancelled' WHERE id = $1",
          [stakeId]
        )
      }

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Successfully left stake'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Stake leave error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to leave stake',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
