import { NextRequest, NextResponse } from 'next/server'
import { upsertUser } from '@/lib/db-utils'

/**
 * POST /api/user/sync
 * Sync user data with database after World ID verification
 */
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()

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
    const username = searchParams.get('username')

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
