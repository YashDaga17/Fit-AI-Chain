import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { Group, GroupMember, CreateGroupRequest, JoinGroupRequest, GroupStats } from '@/types/teams'

// Create group
export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      description, 
      creator_id, 
      is_private = true, 
      max_members = 10 
    }: CreateGroupRequest & { creator_id: number } = await request.json()

    if (!name || !creator_id) {
      return NextResponse.json({
        success: false,
        error: 'Group name and creator ID are required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Create the group
      const groupQuery = `
        INSERT INTO groups (name, description, creator_id, is_private, max_members)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `
      const groupResult = await client.query(groupQuery, [
        name, description, creator_id, is_private, max_members
      ])

      const group = groupResult.rows[0]

      // Add creator as admin member
      const memberQuery = `
        INSERT INTO group_members (group_id, user_id, role)
        VALUES ($1, $2, 'admin')
      `
      await client.query(memberQuery, [group.id, creator_id])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        data: group,
        message: 'Group created successfully'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Group creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create group',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get user's groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const groupId = searchParams.get('groupId')

    if (!userId && !groupId) {
      return NextResponse.json({
        success: false,
        error: 'User ID or Group ID is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      if (groupId) {
        // Get specific group with members
        const groupQuery = `
          SELECT g.*, u.username as creator_username
          FROM groups g
          LEFT JOIN users u ON g.creator_id = u.id
          WHERE g.id = $1
        `
        const groupResult = await client.query(groupQuery, [groupId])

        if (groupResult.rows.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Group not found'
          }, { status: 404 })
        }

        const group = groupResult.rows[0]

        // Get group members
        const membersQuery = `
          SELECT gm.*, u.username
          FROM group_members gm
          JOIN users u ON gm.user_id = u.id
          WHERE gm.group_id = $1
          ORDER BY gm.joined_at
        `
        const membersResult = await client.query(membersQuery, [groupId])

        return NextResponse.json({
          success: true,
          data: {
            ...group,
            members: membersResult.rows,
            member_count: membersResult.rows.length
          }
        })
      } else {
        // Get user's groups
        const query = `
          SELECT g.*, u.username as creator_username, gm.role,
                 COUNT(gm2.user_id) as member_count
          FROM groups g
          JOIN group_members gm ON g.id = gm.group_id
          LEFT JOIN users u ON g.creator_id = u.id
          LEFT JOIN group_members gm2 ON g.id = gm2.group_id
          WHERE gm.user_id = $1
          GROUP BY g.id, u.username, gm.role
          ORDER BY g.created_at DESC
        `
        const result = await client.query(query, [userId])

        return NextResponse.json({
          success: true,
          data: result.rows
        })
      }

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Groups fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch groups',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
