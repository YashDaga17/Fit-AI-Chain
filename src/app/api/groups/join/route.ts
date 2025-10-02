import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

// Join group
export async function POST(request: NextRequest) {
  try {
    const { group_id, user_id } = await request.json()

    if (!group_id || !user_id) {
      return NextResponse.json({
        success: false,
        error: 'Group ID and User ID are required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Check if group exists and has space
      const groupQuery = `
        SELECT g.*, COUNT(gm.user_id) as current_members
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        WHERE g.id = $1
        GROUP BY g.id
      `
      const groupResult = await client.query(groupQuery, [group_id])

      if (groupResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Group not found'
        }, { status: 404 })
      }

      const group = groupResult.rows[0]

      if (group.current_members >= group.max_members) {
        return NextResponse.json({
          success: false,
          error: 'Group is full'
        }, { status: 400 })
      }

      // Check if user is already a member
      const memberCheckQuery = `
        SELECT id FROM group_members 
        WHERE group_id = $1 AND user_id = $2
      `
      const memberCheck = await client.query(memberCheckQuery, [group_id, user_id])

      if (memberCheck.rows.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'User is already a member of this group'
        }, { status: 400 })
      }

      // Add user to group
      const joinQuery = `
        INSERT INTO group_members (group_id, user_id, role)
        VALUES ($1, $2, 'member')
        RETURNING *
      `
      const joinResult = await client.query(joinQuery, [group_id, user_id])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        data: joinResult.rows[0],
        message: 'Successfully joined group'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Group join error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to join group',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Leave group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const userId = searchParams.get('userId')

    if (!groupId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Group ID and User ID are required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Check if user is a member
      const memberQuery = `
        SELECT gm.*, g.creator_id
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        WHERE gm.group_id = $1 AND gm.user_id = $2
      `
      const memberResult = await client.query(memberQuery, [groupId, userId])

      if (memberResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'User is not a member of this group'
        }, { status: 400 })
      }

      const member = memberResult.rows[0]

      // Check if user is the creator
      if (member.creator_id === parseInt(userId)) {
        // Transfer ownership or delete group
        const otherMembersQuery = `
          SELECT user_id FROM group_members 
          WHERE group_id = $1 AND user_id != $2
          ORDER BY joined_at
          LIMIT 1
        `
        const otherMembers = await client.query(otherMembersQuery, [groupId, userId])

        if (otherMembers.rows.length > 0) {
          // Transfer ownership to next member
          const newOwnerId = otherMembers.rows[0].user_id
          await client.query(
            'UPDATE groups SET creator_id = $1 WHERE id = $2',
            [newOwnerId, groupId]
          )
          await client.query(
            'UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3',
            ['admin', groupId, newOwnerId]
          )
        } else {
          // Delete empty group
          await client.query('DELETE FROM groups WHERE id = $1', [groupId])
          await client.query('COMMIT')
          return NextResponse.json({
            success: true,
            message: 'Group deleted (no other members)'
          })
        }
      }

      // Remove user from group
      await client.query(
        'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Successfully left group'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Group leave error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to leave group',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
