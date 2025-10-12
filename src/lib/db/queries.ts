import { db } from '../db'
import { users, foodEntries, leaderboardCache, sessions } from './schema'
import { eq, desc, sql, and, gte } from 'drizzle-orm'

// User operations
export async function createUser(username: string) {
  const [user] = await db.insert(users).values({
    username,
    totalXP: 0,
    totalCalories: 0,
    level: 1,
    streak: 1,
  }).returning()
  
  return user
}

export async function getUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
  
  return user
}

export async function updateUserStats(
  username: string,
  updates: {
    totalXP?: number
    totalCalories?: number
    level?: number
    streak?: number
  }
) {
  const [user] = await db
    .update(users)
    .set({
      ...updates,
      lastActive: new Date(),
    })
    .where(eq(users.username, username))
    .returning()
  
  return user
}

export async function updateUserStreak(username: string) {
  const user = await getUserByUsername(username)
  if (!user) return null

  const now = new Date()
  const lastUpdate = user.lastStreakUpdate || user.lastActive
  const hoursSinceLastUpdate = (now.getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60)

  let newStreak = user.streak

  // If less than 48 hours, maintain or increment streak
  if (hoursSinceLastUpdate < 48) {
    // If more than 24 hours but less than 48, increment
    if (hoursSinceLastUpdate >= 24) {
      newStreak = user.streak + 1
    }
    // If less than 24 hours, keep same streak
  } else {
    // Reset streak if more than 48 hours
    newStreak = 1
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      streak: newStreak,
      lastStreakUpdate: now,
      lastActive: now,
    })
    .where(eq(users.username, username))
    .returning()

  return updatedUser
}

// Food entry operations
export async function createFoodEntry(entry: {
  userId: number
  username: string
  foodName: string
  calories: number
  xpEarned: number
  imageUrl: string
  thumbnailUrl?: string
  confidence?: string
  cuisine?: string
  portionSize?: string
  ingredients?: string[]
  cookingMethod?: string
  nutrients?: any
  healthScore?: string
  allergens?: string[]
  alternatives?: string
  mealType?: string
}) {
  const [foodEntry] = await db.insert(foodEntries).values(entry).returning()
  
  return foodEntry
}

export async function getUserFoodEntries(username: string, limit = 50) {
  const entries = await db
    .select()
    .from(foodEntries)
    .where(eq(foodEntries.username, username))
    .orderBy(desc(foodEntries.createdAt))
    .limit(limit)
  
  return entries
}

export async function getUserFoodEntriesCount(username: string) {
  const results = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(foodEntries)
    .where(eq(foodEntries.username, username))
  
  return results[0]?.count || 0
}

// Leaderboard operations
export async function getLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'alltime', limit = 100) {
  let dateFilter: Date | null = null
  
  if (timeframe === 'daily') {
    dateFilter = new Date()
    dateFilter.setHours(0, 0, 0, 0)
  } else if (timeframe === 'weekly') {
    dateFilter = new Date()
    dateFilter.setDate(dateFilter.getDate() - 7)
  } else if (timeframe === 'monthly') {
    dateFilter = new Date()
    dateFilter.setMonth(dateFilter.getMonth() - 1)
  }

  // For daily/weekly/monthly, calculate from food entries
  if (dateFilter && timeframe !== 'alltime') {
    const results = await db
      .select({
        username: foodEntries.username,
        totalXP: sql<number>`cast(SUM(${foodEntries.xpEarned}) as integer)`,
        totalCalories: sql<number>`cast(SUM(${foodEntries.calories}) as integer)`,
        level: users.level,
        streak: users.streak,
      })
      .from(foodEntries)
      .innerJoin(users, eq(foodEntries.userId, users.id))
      .where(gte(foodEntries.createdAt, dateFilter))
      .groupBy(foodEntries.username, users.level, users.streak)
      .orderBy(desc(sql`SUM(${foodEntries.xpEarned})`))
      .limit(limit)

    return results.map((entry: any, index: number) => ({
      rank: index + 1,
      ...entry,
    }))
  }

  // For all-time, use user stats directly
  const results = await db
    .select({
      username: users.username,
      totalXP: users.totalXP,
      totalCalories: users.totalCalories,
      level: users.level,
      streak: users.streak,
    })
    .from(users)
    .orderBy(desc(users.totalXP))
    .limit(limit)

  return results.map((entry: any, index: number) => ({
    rank: index + 1,
    ...entry,
  }))
}

export async function getUserRank(username: string) {
  const result = await db.execute(sql`
    SELECT COUNT(*) + 1 as rank
    FROM ${users}
    WHERE ${users.totalXP} > (
      SELECT ${users.totalXP}
      FROM ${users}
      WHERE ${users.username} = ${username}
    )
  `)
  
  return (result.rows[0] as any)?.rank || 1
}

// Session operations
export async function createSession(userId: number, username: string, nonce: string) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour session

  const [session] = await db.insert(sessions).values({
    userId,
    username,
    nonce,
    expiresAt,
  }).returning()
  
  return session
}

export async function invalidateUserSessions(username: string) {
  await db
    .update(sessions)
    .set({ isActive: false })
    .where(eq(sessions.username, username))
}

// Analytics queries
export async function getUserStats(username: string) {
  const user = await getUserByUsername(username)
  if (!user) return null

  const entryCountResult = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(foodEntries)
    .where(eq(foodEntries.username, username))

  const todayCaloriesResult = await db
    .select({ total: sql<number>`cast(COALESCE(SUM(${foodEntries.calories}), 0) as integer)` })
    .from(foodEntries)
    .where(
      and(
        eq(foodEntries.username, username),
        gte(foodEntries.createdAt, sql`CURRENT_DATE`)
      )
    )

  return {
    ...user,
    totalEntries: entryCountResult[0]?.count || 0,
    todayCalories: todayCaloriesResult[0]?.total || 0,
  }
}
