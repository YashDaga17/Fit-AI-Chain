import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { Stake, CreateStakeRequest, JoinStakeRequest, StakeStats } from '@/types/teams'

// Create stake
export async function POST(request: NextRequest) {
  try {
    const { 
      group_id, 
      creator_id, 
      competition_type, 
      meal_type, 
      stake_amount, 
      start_time, 
      end_time 
    }: CreateStakeRequest & { creator_id: number } = await request.json()

    if (!group_id || !creator_id || !competition_type || !stake_amount || !start_time) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Verify user is a member of the group
      const memberCheck = await client.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [group_id, creator_id]
      )

      if (memberCheck.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'User is not a member of this group'
        }, { status: 403 })
      }

      // Calculate end time if not provided
      let calculatedEndTime = end_time
      if (!calculatedEndTime) {
        const startDate = new Date(start_time)
        if (competition_type === 'daily') {
          // Daily competition: 24 hours
          calculatedEndTime = new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
        } else if (competition_type === 'meal' && meal_type) {
          // Meal competition: get meal window
          const mealWindowQuery = `
            SELECT start_hour, start_minute, end_hour, end_minute
            FROM meal_windows 
            WHERE meal_type = $1 AND is_active = true
          `
          const mealWindow = await client.query(mealWindowQuery, [meal_type])
          
          if (mealWindow.rows.length > 0) {
            const window = mealWindow.rows[0]
            const endDate = new Date(startDate)
            endDate.setHours(window.end_hour, window.end_minute, 0, 0)
            calculatedEndTime = endDate.toISOString()
          } else {
            // Default 2-hour window
            calculatedEndTime = new Date(startDate.getTime() + 2 * 60 * 60 * 1000).toISOString()
          }
        }
      }

      // Create the stake
      const stakeQuery = `
        INSERT INTO stakes (
          group_id, creator_id, competition_type, meal_type, 
          stake_amount, total_pool, start_time, end_time, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
        RETURNING *
      `
      const stakeResult = await client.query(stakeQuery, [
        group_id, creator_id, competition_type, meal_type, 
        stake_amount, stake_amount, start_time, calculatedEndTime
      ])

      const stake = stakeResult.rows[0]

      // Add creator as first participant
      const participantQuery = `
        INSERT INTO stake_participants (stake_id, user_id, amount)
        VALUES ($1, $2, $3)
      `
      await client.query(participantQuery, [stake.id, creator_id, stake_amount])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        data: stake,
        message: 'Stake created successfully'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Stake creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create stake',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get stakes for a group or user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'active'
    const stakeId = searchParams.get('stakeId')

    const client = await pool.connect()

    try {
      if (stakeId) {
        // Get specific stake with participants
        const stakeQuery = `
          SELECT s.*, g.name as group_name, u.username as creator_username
          FROM stakes s
          JOIN groups g ON s.group_id = g.id
          JOIN users u ON s.creator_id = u.id
          WHERE s.id = $1
        `
        const stakeResult = await client.query(stakeQuery, [stakeId])

        if (stakeResult.rows.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Stake not found'
          }, { status: 404 })
        }

        const stake = stakeResult.rows[0]

        // Get participants
        const participantsQuery = `
          SELECT sp.*, u.username
          FROM stake_participants sp
          JOIN users u ON sp.user_id = u.id
          WHERE sp.stake_id = $1
          ORDER BY sp.calories_tracked DESC, sp.joined_at
        `
        const participantsResult = await client.query(participantsQuery, [stakeId])

        return NextResponse.json({
          success: true,
          data: {
            ...stake,
            participants: participantsResult.rows
          }
        })
      }

      let query = `
        SELECT s.*, g.name as group_name, u.username as creator_username,
               COUNT(sp.user_id) as participant_count
        FROM stakes s
        JOIN groups g ON s.group_id = g.id
        JOIN users u ON s.creator_id = u.id
        LEFT JOIN stake_participants sp ON s.id = sp.stake_id
        WHERE s.status = $1
      `
      const queryParams = [status]

      if (groupId) {
        query += ` AND s.group_id = $${queryParams.length + 1}`
        queryParams.push(groupId)
      }

      if (userId) {
        query += ` AND EXISTS (
          SELECT 1 FROM stake_participants sp2 
          WHERE sp2.stake_id = s.id AND sp2.user_id = $${queryParams.length + 1}
        )`
        queryParams.push(userId)
      }

      query += ` GROUP BY s.id, g.name, u.username ORDER BY s.created_at DESC`

      const result = await client.query(query, queryParams)

      return NextResponse.json({
        success: true,
        data: result.rows
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Stakes fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stakes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
