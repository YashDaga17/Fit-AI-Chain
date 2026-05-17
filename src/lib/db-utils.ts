import { db, isDatabaseConnected } from './db'
import { users, foodEntries, userPreferences, exerciseLogs } from './db/schema'
import { and, eq, desc, sql } from 'drizzle-orm'
import type { UserPreferences, WeeklyAnalytics } from '@/types/analytics'

const mockExerciseLogs: any[] = []

function createMockUser(
  username: string,
  overrides: Partial<Record<'totalXP' | 'totalCalories' | 'level' | 'streak', number>> = {}
) {
  return {
    id: 1,
    username,
    totalXP: overrides.totalXP ?? 0,
    totalCalories: overrides.totalCalories ?? 0,
    level: overrides.level ?? 1,
    streak: overrides.streak ?? 1,
    joinedAt: new Date(),
    lastActive: new Date(),
    lastStreakUpdate: new Date(),
    totalEntries: 0,
  }
}

function createDefaultPreferences(): UserPreferences {
  return {
    dailyCalorieGoal: 2000,
    proteinGoal: 120,
    carbsGoal: 220,
    fatGoal: 70,
    fiberGoal: 30,
    theme: 'light',
    notifications: true,
    units: 'metric',
    language: 'en',
  }
}

export async function upsertUser(username: string) {
  if (!isDatabaseConnected || !db) {
    return createMockUser(username)
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
  if (!isDatabaseConnected || !db) {
    return createMockUser(username)
  }

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
  if (!isDatabaseConnected || !db) {
    return createMockUser(username, {
      totalXP: updates.totalXP,
      totalCalories: updates.totalCalories,
      level: updates.level,
      streak: updates.streak,
    })
  }

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

async function recalculateUserTotals(username: string) {
  const user = await getUserByUsername(username)
  if (!user || !isDatabaseConnected || !db) {
    return user
  }

  const [totals] = await db
    .select({
      totalXP: sql<number>`cast(coalesce(sum(${foodEntries.xpEarned}), 0) as integer)`,
      totalCalories: sql<number>`cast(coalesce(sum(${foodEntries.calories}), 0) as integer)`,
    })
    .from(foodEntries)
    .where(eq(foodEntries.username, username))

  return updateUserStats(username, {
    totalXP: totals?.totalXP || 0,
    totalCalories: totals?.totalCalories || 0,
    level: calculateLevel(totals?.totalXP || 0),
  })
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

export async function updateFoodEntryById(
  id: number,
  username: string,
  updates: {
    foodName?: string
    calories?: number
    xpEarned?: number
    imageUrl?: string
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
  }
) {
  if (!isDatabaseConnected || !db) {
    return {
      id,
      username,
      ...updates,
      updatedAt: new Date(),
    }
  }

  const [entry] = await db
    .update(foodEntries)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(foodEntries.id, id), eq(foodEntries.username, username)))
    .returning()

  if (!entry) {
    return null
  }

  await recalculateUserTotals(username)
  return entry
}

export async function deleteFoodEntryById(id: number, username: string) {
  if (!isDatabaseConnected || !db) {
    return true
  }

  const [entry] = await db
    .delete(foodEntries)
    .where(and(eq(foodEntries.id, id), eq(foodEntries.username, username)))
    .returning()

  if (!entry) {
    return false
  }

  await recalculateUserTotals(username)
  return true
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

export async function getUserPreferences(username: string): Promise<UserPreferences> {
  if (!isDatabaseConnected || !db) {
    return createDefaultPreferences()
  }

  const user = await upsertUser(username)

  const [preferences] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1)

  if (!preferences) {
    return createDefaultPreferences()
  }

  return {
    dailyCalorieGoal: preferences.dailyCalorieGoal ?? 2000,
    proteinGoal: preferences.proteinGoal ?? 120,
    carbsGoal: preferences.carbsGoal ?? 220,
    fatGoal: preferences.fatGoal ?? 70,
    fiberGoal: preferences.fiberGoal ?? 30,
    theme: preferences.theme ?? 'light',
    notifications: preferences.notifications ?? true,
    units: preferences.units ?? 'metric',
    language: preferences.language ?? 'en',
  }
}

export async function upsertUserPreferences(
  username: string,
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  const nextPreferences = {
    ...createDefaultPreferences(),
    ...updates,
  }

  if (!isDatabaseConnected || !db) {
    return nextPreferences
  }

  const user = await upsertUser(username)

  const [existing] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1)

  if (existing) {
    const [updated] = await db
      .update(userPreferences)
      .set({
        dailyCalorieGoal: nextPreferences.dailyCalorieGoal,
        proteinGoal: nextPreferences.proteinGoal,
        carbsGoal: nextPreferences.carbsGoal,
        fatGoal: nextPreferences.fatGoal,
        fiberGoal: nextPreferences.fiberGoal,
        theme: nextPreferences.theme,
        notifications: nextPreferences.notifications,
        units: nextPreferences.units,
        language: nextPreferences.language,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, user.id))
      .returning()

    return {
      dailyCalorieGoal: updated.dailyCalorieGoal ?? 2000,
      proteinGoal: updated.proteinGoal ?? 120,
      carbsGoal: updated.carbsGoal ?? 220,
      fatGoal: updated.fatGoal ?? 70,
      fiberGoal: updated.fiberGoal ?? 30,
      theme: updated.theme ?? 'light',
      notifications: updated.notifications ?? true,
      units: updated.units ?? 'metric',
      language: updated.language ?? 'en',
    }
  }

  const [created] = await db
    .insert(userPreferences)
    .values({
      userId: user.id,
      dailyCalorieGoal: nextPreferences.dailyCalorieGoal,
      proteinGoal: nextPreferences.proteinGoal,
      carbsGoal: nextPreferences.carbsGoal,
      fatGoal: nextPreferences.fatGoal,
      fiberGoal: nextPreferences.fiberGoal,
      theme: nextPreferences.theme,
      notifications: nextPreferences.notifications,
      units: nextPreferences.units,
      language: nextPreferences.language,
    })
    .returning()

  return {
    dailyCalorieGoal: created.dailyCalorieGoal ?? 2000,
    proteinGoal: created.proteinGoal ?? 120,
    carbsGoal: created.carbsGoal ?? 220,
    fatGoal: created.fatGoal ?? 70,
    fiberGoal: created.fiberGoal ?? 30,
    theme: created.theme ?? 'light',
    notifications: created.notifications ?? true,
    units: created.units ?? 'metric',
    language: created.language ?? 'en',
  }
}

export async function getWeeklyAnalytics(username: string): Promise<WeeklyAnalytics> {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfToday)
    date.setDate(startOfToday.getDate() - (6 - index))
    return date
  })

  if (!isDatabaseConnected || !db) {
    return {
      todayCalories: 0,
      weeklyCalories: 0,
      averageDailyCalories: 0,
      weeklyXP: 0,
      daysLogged: 0,
      currentStreak: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFat: 0,
      averageFiber: 0,
      dailyBreakdown: lastSevenDays.map((date) => ({
        date: date.toISOString(),
        calories: 0,
        xp: 0,
        entries: 0,
      })),
      topMealType: 'No data yet',
    }
  }

  const weekStart = new Date(startOfToday)
  weekStart.setDate(startOfToday.getDate() - 6)

  const entries = await db
    .select()
    .from(foodEntries)
    .where(and(eq(foodEntries.username, username), sql`${foodEntries.createdAt} >= ${weekStart}`))
    .orderBy(desc(foodEntries.createdAt))

  const streakUser = await getUserByUsername(username)
  let proteinTotal = 0
  let carbsTotal = 0
  let fatTotal = 0
  let fiberTotal = 0

  const dailyMap = new Map<string, { calories: number; xp: number; entries: number }>()
  const mealCounts = new Map<string, number>()

  for (const date of lastSevenDays) {
    dailyMap.set(date.toDateString(), { calories: 0, xp: 0, entries: 0 })
  }

  for (const entry of entries) {
    const entryDate = new Date(entry.createdAt).toDateString()
    const current = dailyMap.get(entryDate)
    if (current) {
      current.calories += entry.calories || 0
      current.xp += entry.xpEarned || 0
      current.entries += 1
    }

    const mealType = entry.mealType || 'meal'
    mealCounts.set(mealType, (mealCounts.get(mealType) || 0) + 1)

    proteinTotal += parseNutrientValue(entry.nutrients?.protein)
    carbsTotal += parseNutrientValue(entry.nutrients?.carbs)
    fatTotal += parseNutrientValue(entry.nutrients?.fat)
    fiberTotal += parseNutrientValue(entry.nutrients?.fiber)
  }

  const dailyBreakdown = lastSevenDays.map((date) => {
    const values = dailyMap.get(date.toDateString()) || { calories: 0, xp: 0, entries: 0 }
    return {
      date: date.toISOString(),
      calories: values.calories,
      xp: values.xp,
      entries: values.entries,
    }
  })

  const weeklyCalories = dailyBreakdown.reduce((sum, day) => sum + day.calories, 0)
  const weeklyXP = dailyBreakdown.reduce((sum, day) => sum + day.xp, 0)
  const daysLogged = dailyBreakdown.filter((day) => day.entries > 0).length
  const todayCalories = dailyBreakdown[dailyBreakdown.length - 1]?.calories || 0
  const topMealTypeEntry = [...mealCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  return {
    todayCalories,
    weeklyCalories,
    averageDailyCalories: Math.round(weeklyCalories / 7),
    weeklyXP,
    daysLogged,
    currentStreak: streakUser?.streak || 0,
    averageProtein: Math.round(proteinTotal / 7),
    averageCarbs: Math.round(carbsTotal / 7),
    averageFat: Math.round(fatTotal / 7),
    averageFiber: Math.round(fiberTotal / 7),
    dailyBreakdown,
    topMealType: topMealTypeEntry ? topMealTypeEntry[0] : 'No data yet',
  }
}

function parseNutrientValue(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value !== 'string') {
    return 0
  }

  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Exercise Log Functions
 */

/**
 * Create a new exercise log entry
 */
export async function createExerciseLog(entry: {
  userId: number
  username: string
  exerciseName: string
  duration: number
  caloriesBurned: number
  intensity?: string
  category?: string
  date: string
}) {
  if (!isDatabaseConnected || !db) {
    const mockEntry = {
      id: Date.now(),
      ...entry,
      intensity: entry.intensity || 'medium',
      category: entry.category || null,
      createdAt: new Date().toISOString(),
    }
    mockExerciseLogs.push(mockEntry)
    return mockEntry
  }

  try {
    const dbEntry = {
      ...entry,
      intensity: entry.intensity || 'medium',
      category: entry.category === undefined ? null : entry.category,
    }
    const [newEntry] = await db.insert(exerciseLogs).values(dbEntry).returning()
    return newEntry
  } catch (error) {
    throw error
  }
}

/**
 * Get exercise logs for a user, optionally filtered by date
 */
export async function getExerciseLogsByUsername(
  username: string,
  dateFilter?: string,
  limit: number = 50,
  offset: number = 0
) {
  if (!isDatabaseConnected || !db) {
    const filtered = mockExerciseLogs.filter(
      (log) => log.username === username && (!dateFilter || log.date === dateFilter)
    )
    const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return sorted.slice(offset, offset + limit)
  }

  try {
    const conditions = [eq(exerciseLogs.username, username)]
    if (dateFilter) {
      conditions.push(eq(exerciseLogs.date, dateFilter))
    }

    const entries = await db
      .select()
      .from(exerciseLogs)
      .where(and(...conditions))
      .orderBy(desc(exerciseLogs.createdAt))
      .limit(limit)
      .offset(offset)

    return entries
  } catch (error) {
    throw error
  }
}

/**
 * Get today's exercise logs for a user
 */
export async function getTodayExerciseLogs(username: string) {
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  return getExerciseLogsByUsername(username, today)
}

/**
 * Delete an exercise log by id and username
 */
export async function deleteExerciseLogById(id: number, username: string) {
  if (!isDatabaseConnected || !db) {
    const index = mockExerciseLogs.findIndex(
      (log) => log.id === id && log.username === username
    )
    if (index !== -1) {
      mockExerciseLogs.splice(index, 1)
      return true
    }
    return false
  }

  const [entry] = await db
    .delete(exerciseLogs)
    .where(and(eq(exerciseLogs.id, id), eq(exerciseLogs.username, username)))
    .returning()

  return !!entry
}

