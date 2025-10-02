import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { User, APIResponse, UserSearchResult } from '@/types/teams'

// Get or create user
export async function POST(request: NextRequest) {
  try {
    const { username, wallet_address, nullifier_hash, verification_type = 'guest' } = await request.json()

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Check if user already exists
      let userQuery = 'SELECT * FROM users WHERE username = $1'
      let userResult = await client.query(userQuery, [username])

      if (userResult.rows.length > 0) {
        // User exists, update if needed
        const user = userResult.rows[0]
        
        if (verification_type !== 'guest' && user.verification_type === 'guest') {
          // Upgrade from guest to verified
          const updateQuery = `
            UPDATE users 
            SET wallet_address = $1, nullifier_hash = $2, verification_type = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
          `
          const updateResult = await client.query(updateQuery, [
            wallet_address, nullifier_hash, verification_type, user.id
          ])
          
          return NextResponse.json({
            success: true,
            data: updateResult.rows[0],
            message: 'User upgraded successfully'
          })
        }

        return NextResponse.json({
          success: true,
          data: user,
          message: 'User found'
        })
      }

      // Create new user
      const insertQuery = `
        INSERT INTO users (username, wallet_address, nullifier_hash, verification_type)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `
      const insertResult = await client.query(insertQuery, [
        username, wallet_address, nullifier_hash, verification_type
      ])

      return NextResponse.json({
        success: true,
        data: insertResult.rows[0],
        message: 'User created successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('User management error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to manage user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Search users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const currentUserId = searchParams.get('currentUserId')

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      let searchQuery = `
        SELECT id, username, level, total_xp, verification_type
        FROM users 
        WHERE username ILIKE $1
      `
      const queryParams = [`%${query}%`]

      if (currentUserId) {
        searchQuery += ` AND id != $2`
        queryParams.push(currentUserId)
      }

      searchQuery += ` ORDER BY total_xp DESC LIMIT $${queryParams.length + 1}`
      queryParams.push(limit.toString())

      const result = await client.query(searchQuery, queryParams)

      const users: UserSearchResult[] = result.rows.map(row => ({
        id: row.id,
        username: row.username,
        level: row.level,
        total_xp: row.total_xp,
        verification_type: row.verification_type
      }))

      return NextResponse.json({
        success: true,
        data: users
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to search users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Update user stats
export async function PUT(request: NextRequest) {
  try {
    const { 
      user_id, 
      total_calories, 
      total_xp, 
      streak, 
      level, 
      total_entries 
    } = await request.json()

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      const updateQuery = `
        UPDATE users 
        SET 
          total_calories = COALESCE($1, total_calories),
          total_xp = COALESCE($2, total_xp),
          streak = COALESCE($3, streak),
          level = COALESCE($4, level),
          total_entries = COALESCE($5, total_entries),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `
      
      const result = await client.query(updateQuery, [
        total_calories, total_xp, streak, level, total_entries, user_id
      ])

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'User stats updated successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('User stats update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update user stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
