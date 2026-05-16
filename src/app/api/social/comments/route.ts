import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comments, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const foodEntryId = searchParams.get('foodEntryId')

  if (!foodEntryId) {
    return NextResponse.json({ error: 'foodEntryId is required' }, { status: 400 })
  }

  const id = parseInt(foodEntryId, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid foodEntryId' }, { status: 400 })
  }

  try {
    const results = await db
      .select({
        id: comments.id,
        comment: comments.comment,
        createdAt: comments.createdAt,
        username: users.username,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.foodEntryId, id))
      .orderBy(desc(comments.createdAt))

    return NextResponse.json({ comments: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { username, foodEntryId, comment } = body

  if (!username || !foodEntryId || !comment) {
    return NextResponse.json({ error: 'Username, foodEntryId, and comment are required' }, { status: 400 })
  }

  const id = parseInt(foodEntryId, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid foodEntryId' }, { status: 400 })
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

    const [newComment] = await db.insert(comments).values({
      userId: user.id,
      foodEntryId: id,
      comment
    }).returning()

    return NextResponse.json({ comment: newComment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
