import { NextRequest, NextResponse } from 'next/server'

import { getUserPreferences, upsertUserPreferences } from '@/lib/db-utils'
import { normalizeUsername, clampInteger } from '@/lib/validation'

export async function GET(req: NextRequest) {
  try {
    const username = normalizeUsername(req.nextUrl.searchParams.get('username'))

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const preferences = await getUserPreferences(username)
    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const username = normalizeUsername(body.username)

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const preferences = await upsertUserPreferences(username, {
      dailyCalorieGoal: clampInteger(body.dailyCalorieGoal, 2000, 500, 10000),
      proteinGoal: clampInteger(body.proteinGoal, 120, 20, 400),
      carbsGoal: clampInteger(body.carbsGoal, 220, 20, 600),
      fatGoal: clampInteger(body.fatGoal, 70, 10, 250),
      fiberGoal: clampInteger(body.fiberGoal, 30, 5, 100),
      theme: typeof body.theme === 'string' ? body.theme : undefined,
      notifications: typeof body.notifications === 'boolean' ? body.notifications : undefined,
      units: typeof body.units === 'string' ? body.units : undefined,
      language: typeof body.language === 'string' ? body.language : undefined,
    })

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
