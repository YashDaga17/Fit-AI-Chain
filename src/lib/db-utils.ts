import { db, isDatabaseConnected } from './db'
import { users, foodEntries } from './db/schema'
import { eq, desc, sql } from 'drizzle-orm'


export async function upsertUser(username: string) {
  if (!isDatabaseConnected || !db) {
    // Return mock user data for development
    return {
      id: 1,
      username,
      totalXP: 0,
      totalCalories: 0,
      level: 1,
      streak: 1,
      joinedAt: new Date(),
      lastActive: new Date(),
      lastStreakUpdate: new Date(),
      totalEntries: 0,
    }
  }

  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (existingUser.length > 0) {
      // Update last active
      await db
        .update(users)
        .set({ lastActive: new Date() })
        .where(eq(users.username, username))
      
      const [entryCount] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(foodEntries)
        .where(eq(foodEntries.username, username))

      return {
        ...existingUser[0],
        totalEntries: entryCount?.count || 0,
      }
    }

    // Create new user
    const [user] = await db.insert(users).values({
      username,
      totalXP: 0,
      totalCalories: 0,
      level: 1,
      streak: 1,
    }).returning()
    
    return {
      ...user,
      totalEntries: 0,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (!user) return null

    const [entryCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(foodEntries)
      .where(eq(foodEntries.username, username))

    return {
      ...user,
      totalEntries: entryCount?.count || 0,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Update user stats
 */
export async function updateUserStats(
  username: string,
  updates: {
    totalXP?: number
    level?: number
    streak?: number
    totalCalories?: number
  }
) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, lastActive: new Date() })
      .where(eq(users.username, username))
      .returning()

    return updatedUser
  } catch (error) {
    throw error
  }
}

/**
 * Food Entry Functions
 */

/**
 * Create a new food entry
 */
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
  if (!isDatabaseConnected || !db) {
    // Return mock entry for development
    return {
      id: Date.now(),
      ...entry,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  try {
    const [newEntry] = await db.insert(foodEntries).values(entry).returning()

    // Update user stats
    const user = await getUserByUsername(entry.username)
    if (user) {
      await updateUserStats(entry.username, {
        totalXP: (user.totalXP || 0) + (entry.xpEarned || 0),
        totalCalories: (user.totalCalories || 0) + entry.calories,
        level: calculateLevel((user.totalXP || 0) + (entry.xpEarned || 0)),
      })
    }

    return newEntry
  } catch (error) {
    throw error
  }
}

/**
 * Get food entries for a user
 */
export async function getFoodEntriesByUsername(
  username: string,
  limit: number = 50,
  offset: number = 0
) {
  if (!isDatabaseConnected || !db) {
    // Return empty array for development
    return []
  }

  try {
    const entries = await db
      .select()
      .from(foodEntries)
      .where(eq(foodEntries.username, username))
      .orderBy(desc(foodEntries.createdAt))
      .limit(limit)
      .offset(offset)

    return entries
  } catch (error) {
    throw error
  }
}

/**
 * Leaderboard Functions
 */

/**
 * Get global leaderboard
 */
export async function getLeaderboard(limit: number = 100) {
  if (!isDatabaseConnected || !db) {
    // Return empty leaderboard for development
    return []
  }

  try {
    const leaderboard = await db
      .select({
        username: users.username,
        totalXP: users.totalXP,
        level: users.level,
        totalCalories: users.totalCalories,
        streak: users.streak,
        joinedAt: users.joinedAt,
      })
      .from(users)
      .orderBy(desc(users.totalXP))
      .limit(limit)

    // Get total entries for each user
    const leaderboardWithEntries = await Promise.all(
      leaderboard.map(async (entry: typeof leaderboard[0]) => {
        const [entryCount] = await db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(foodEntries)
          .where(eq(foodEntries.username, entry.username))

        return {
          ...entry,
          totalEntries: entryCount.count || 0,
          rank: 0, // Will be set below
        }
      })
    )

    // Add rank
    return leaderboardWithEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
  } catch (error) {
    throw error
  }
}

/**
 * Get user rank
 */
export async function getUserRank(username: string) {
  try {
    const user = await getUserByUsername(username)
    if (!user) return null

    const result = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM users
      WHERE total_xp > ${user.totalXP}
    `)

    return { rank: Number(result.rows[0]?.rank || 0) }
  } catch (error) {
    throw error
  }
}

/**
 * Utility Functions
 */

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Calculate XP for next level
 */
export function getXPForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

/**
 * Get user statistics
 */
export async function getUserStats(username: string) {
  try {
    const user = await getUserByUsername(username)
    if (!user) return null

    const rank = await getUserRank(username)
    const xpForNextLevel = getXPForNextLevel((user.level || 1) + 1)
    const xpProgress = (user.totalXP || 0) % getXPForNextLevel(user.level || 1)

    return {
      ...user,
      rank: rank?.rank || 0,
      xpForNextLevel,
      xpProgress,
    }
  } catch (error) {
    throw error
  }
}
