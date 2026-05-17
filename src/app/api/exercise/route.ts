import { NextRequest, NextResponse } from 'next/server'
import {
  upsertUser,
  createExerciseLog,
  getExerciseLogsByUsername,
  deleteExerciseLogById,
} from '@/lib/db-utils'
import { normalizeUsername, sanitizeString, clampInteger } from '@/lib/validation'

/**
 * GET /api/exercise?username=xxx&date=YYYY-MM-DD
 * Get exercise logs for a user, optionally filtered by date
 */
export async function GET(req: NextRequest) {
  try {
    const username = normalizeUsername(req.nextUrl.searchParams.get('username'))
    const date = sanitizeString(req.nextUrl.searchParams.get('date'), 10)

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Missing username' },
        { status: 400 }
      )
    }

    const logs = await getExerciseLogsByUsername(
      username,
      date ?? undefined,
      50,
      0
    )

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve exercise logs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/exercise
 * Create a new exercise log
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = normalizeUsername(body.username)

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Missing username' },
        { status: 400 }
      )
    }

    const exerciseName = sanitizeString(body.exerciseName, 200)
    const duration = clampInteger(body.duration, NaN, 1, 600)
    const caloriesBurned = clampInteger(body.caloriesBurned, NaN, 0, 10000)
    const intensity = sanitizeString(body.intensity, 20) || 'medium'
    const category = sanitizeString(body.category, 50)
    const date = sanitizeString(body.date, 10)

    if (!exerciseName || !Number.isFinite(duration) || !Number.isFinite(caloriesBurned) || !date) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid exercise data' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    // Ensure user exists
    const user = await upsertUser(username)

    const newLog = await createExerciseLog({
      userId: user.id,
      username,
      exerciseName,
      duration,
      caloriesBurned,
      intensity,
      category: category ?? undefined,
      date,
    })

    return NextResponse.json({ success: true, log: newLog })
  } catch (error: any) {
    if (error.message?.includes('connection')) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to save exercise log. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/exercise?id=xxx&username=xxx
 * Delete an exercise log by id
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = normalizeUsername(searchParams.get('username'))
    const id = clampInteger(searchParams.get('id'), NaN, 1, Number.MAX_SAFE_INTEGER)

    if (!username || !Number.isFinite(id)) {
      return NextResponse.json(
        { success: false, message: 'Missing id or username' },
        { status: 400 }
      )
    }

    const deleted = await deleteExerciseLogById(id, username)
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Exercise log not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete exercise log' },
      { status: 500 }
    )
  }
}
