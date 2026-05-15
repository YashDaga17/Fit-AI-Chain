import { NextRequest, NextResponse } from 'next/server'

import { getWeeklyAnalytics } from '@/lib/db-utils'
import { normalizeUsername } from '@/lib/validation'

export async function GET(req: NextRequest) {
  try {
    const username = normalizeUsername(req.nextUrl.searchParams.get('username'))

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const analytics = await getWeeklyAnalytics(username)
    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
