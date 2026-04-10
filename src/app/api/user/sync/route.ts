import { NextRequest, NextResponse } from 'next/server'
import { upsertUser, updateUserStats } from '@/lib/db-utils'
import { normalizeUsername } from '@/lib/validation'

/**
 * POST /api/user/sync
 * Sync user data with database after World ID verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = normalizeUsername(body.username)

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const existingUser = await upsertUser(username)

    const hasStatUpdates = ['totalXP', 'level', 'streak', 'totalCalories'].some((key) => typeof body[key] === 'number')
    const user = hasStatUpdates
      ? await updateUserStats(username, {
          totalXP: typeof body.totalXP === 'number' ? body.totalXP : undefined,
          level: typeof body.level === 'number' ? body.level : undefined,
          streak: typeof body.streak === 'number' ? body.streak : undefined,
          totalCalories: typeof body.totalCalories === 'number' ? body.totalCalories : undefined,
        })
      : existingUser
    const totalEntries = user?.totalEntries ?? existingUser.totalEntries ?? 0

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        totalXP: user.totalXP,
        level: user.level,
        streak: user.streak,
        totalCalories: user.totalCalories,
        totalEntries,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to sync user', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/sync?username=...
 * Get user data from database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = normalizeUsername(searchParams.get('username'))

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const user = await upsertUser(username)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        totalXP: user.totalXP,
        level: user.level,
        streak: user.streak,
        totalCalories: user.totalCalories,
        totalEntries: user.totalEntries,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get user', details: error.message },
      { status: 500 }
    )
  }
}
