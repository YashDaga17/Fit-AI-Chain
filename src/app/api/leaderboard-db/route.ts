import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/db-utils'

/**
 * GET /api/leaderboard
 * Get the global leaderboard with real users from database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const leaderboard = await getLeaderboard(limit)

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard.map((entry) => ({
        rank: entry.rank,
        username: entry.username,
        totalXP: entry.totalXP,
        level: entry.level,
        totalCalories: entry.totalCalories,
        streak: entry.streak,
        joinedAt: entry.joinedAt,
      })),
      count: leaderboard.length,
    })
  } catch (error: any) {
    console.error('Error getting leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to get leaderboard', details: error.message },
      { status: 500 }
    )
  }
}
