import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { friendships, users } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    const usersResult = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    
    const user = usersResult[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get friends where user is either userId or friendId and status is accepted
    const friends = await db
      .select()
      .from(friendships)
      .where(
        and(
          or(eq(friendships.userId, user.id), eq(friendships.friendId, user.id)),
          eq(friendships.status, 'accepted')
        )
      )

    return NextResponse.json({ friends })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { username, friendUsername } = body

  if (!username || !friendUsername) {
    return NextResponse.json({ error: 'Username and friendUsername are required' }, { status: 400 })
  }

  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    
    const friendResult = await db
      .select()
      .from(users)
      .where(eq(users.username, friendUsername))
      .limit(1)

    const user = userResult[0]
    const friend = friendResult[0]

    if (!user || !friend) {
      return NextResponse.json({ error: 'User or friend not found' }, { status: 404 })
    }

    // Check if friendship already exists
    const existing = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, user.id), eq(friendships.friendId, friend.id)),
          and(eq(friendships.userId, friend.id), eq(friendships.friendId, user.id))
        )
      )

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Friendship or request already exists' }, { status: 400 })
    }

    const [newFriendship] = await db.insert(friendships).values({
      userId: user.id,
      friendId: friend.id,
      status: 'pending'
    }).returning()

    return NextResponse.json({ friendship: newFriendship })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
