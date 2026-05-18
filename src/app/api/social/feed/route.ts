import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activityFeed, friendships, users } from '@/lib/db/schema'
import { eq, and, or, inArray, desc } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    
    const user = userResult[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get friends
    const friends = await db
      .select()
      .from(friendships)
      .where(
        and(
          or(eq(friendships.userId, user.id), eq(friendships.friendId, user.id)),
          eq(friendships.status, 'accepted')
        )
      )

    const friendIds = friends.map(f => f.userId === user.id ? f.friendId : f.userId)
    const allIds = [...friendIds, user.id]

    // Fetch feed items for these users
    const feed = await db
      .select()
      .from(activityFeed)
      .where(inArray(activityFeed.userId, allIds))
      .orderBy(desc(activityFeed.createdAt))
      .limit(50)

    return NextResponse.json({ feed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
