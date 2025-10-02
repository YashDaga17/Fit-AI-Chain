import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { GroupLeaderboardEntry } from '@/types/teams'

// Get group/stake leaderboards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const stakeId = searchParams.get('stakeId')
    const type = searchParams.get('type') || 'daily' // daily, weekly, alltime
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!groupId && !stakeId) {
      return NextResponse.json({
        success: false,
        error: 'Group ID or Stake ID is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      let query = ''
      let queryParams: any[] = []

      if (stakeId) {
        // Stake-specific leaderboard
        query = `
          SELECT 
            sp.user_id,
            u.username,
            sp.calories_tracked as calories,
            sp.images_submitted as images_count,
            sp.is_qualified,
            COALESCE(SUM(fe.xp_earned), 0) as xp_earned,
            ROW_NUMBER() OVER (ORDER BY sp.calories_tracked DESC, sp.images_submitted DESC) as rank
          FROM stake_participants sp
          JOIN users u ON sp.user_id = u.id
          LEFT JOIN food_entries fe ON fe.user_id = sp.user_id AND fe.stake_id = sp.stake_id
          WHERE sp.stake_id = $1
          GROUP BY sp.user_id, u.username, sp.calories_tracked, sp.images_submitted, sp.is_qualified
          ORDER BY rank
        `
        queryParams = [stakeId]
      } else if (groupId) {
        // Group leaderboard based on type
        if (type === 'daily') {
          query = `
            SELECT 
              gm.user_id,
              u.username,
              COALESCE(ush.calories, 0) as calories,
              COALESCE(ush.entries_count, 0) as images_count,
              COALESCE(ush.xp_earned, 0) as xp_earned,
              true as is_qualified,
              ROW_NUMBER() OVER (ORDER BY COALESCE(ush.calories, 0) DESC, COALESCE(ush.xp_earned, 0) DESC) as rank
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            LEFT JOIN user_stats_history ush ON ush.user_id = gm.user_id AND ush.date = $2
            WHERE gm.group_id = $1
            ORDER BY rank
          `
          queryParams = [groupId, date]
        } else if (type === 'weekly') {
          const weekStart = new Date(date)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)

          query = `
            SELECT 
              gm.user_id,
              u.username,
              COALESCE(SUM(ush.calories), 0) as calories,
              COALESCE(SUM(ush.entries_count), 0) as images_count,
              COALESCE(SUM(ush.xp_earned), 0) as xp_earned,
              true as is_qualified,
              ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ush.calories), 0) DESC, COALESCE(SUM(ush.xp_earned), 0) DESC) as rank
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            LEFT JOIN user_stats_history ush ON ush.user_id = gm.user_id 
              AND ush.date >= $2 AND ush.date <= $3
            WHERE gm.group_id = $1
            GROUP BY gm.user_id, u.username
            ORDER BY rank
          `
          queryParams = [groupId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
        } else {
          // All time
          query = `
            SELECT 
              gm.user_id,
              u.username,
              u.total_calories as calories,
              u.total_entries as images_count,
              u.total_xp as xp_earned,
              true as is_qualified,
              ROW_NUMBER() OVER (ORDER BY u.total_calories DESC, u.total_xp DESC) as rank
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = $1
            ORDER BY rank
          `
          queryParams = [groupId]
        }
      }

      const result = await client.query(query, queryParams)

      const leaderboard: GroupLeaderboardEntry[] = result.rows.map(row => ({
        user_id: row.user_id,
        username: row.username,
        calories: parseInt(row.calories) || 0,
        images_count: parseInt(row.images_count) || 0,
        xp_earned: parseInt(row.xp_earned) || 0,
        rank: parseInt(row.rank),
        is_qualified: row.is_qualified || true
      }))

      return NextResponse.json({
        success: true,
        data: leaderboard
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Finalize stake and determine winner
export async function POST(request: NextRequest) {
  try {
    const { stake_id } = await request.json()

    if (!stake_id) {
      return NextResponse.json({
        success: false,
        error: 'Stake ID is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Check if stake is ready to be finalized
      const stakeQuery = `
        SELECT * FROM stakes 
        WHERE id = $1 AND status = 'active' AND end_time <= NOW()
      `
      const stakeResult = await client.query(stakeQuery, [stake_id])

      if (stakeResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Stake is not ready to be finalized'
        }, { status: 400 })
      }

      const stake = stakeResult.rows[0]

      // Find winner (highest calories among qualified participants)
      const winnerQuery = `
        SELECT sp.user_id, sp.calories_tracked, u.username
        FROM stake_participants sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.stake_id = $1 AND sp.is_qualified = true
        ORDER BY sp.calories_tracked DESC, sp.joined_at ASC
        LIMIT 1
      `
      const winnerResult = await client.query(winnerQuery, [stake_id])

      let winnerId = null
      if (winnerResult.rows.length > 0) {
        winnerId = winnerResult.rows[0].user_id
      }

      // Update stake with winner and mark as completed
      await client.query(`
        UPDATE stakes 
        SET status = 'completed', winner_id = $1
        WHERE id = $2
      `, [winnerId, stake_id])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        data: {
          stake_id,
          winner_id: winnerId,
          winner_username: winnerResult.rows[0]?.username,
          total_pool: stake.total_pool
        },
        message: winnerId ? 'Stake completed with winner' : 'Stake completed with no qualified winner'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Stake finalization error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to finalize stake',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
