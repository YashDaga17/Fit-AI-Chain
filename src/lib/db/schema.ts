import { pgTable, serial, text, integer, timestamp, jsonb, boolean, varchar, decimal } from 'drizzle-orm/pg-core'

// Users table - stores World App authenticated users (username only)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  totalXP: integer('total_xp').default(0).notNull(),
  totalCalories: integer('total_calories').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  streak: integer('streak').default(1).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastActive: timestamp('last_active').defaultNow().notNull(),
  lastStreakUpdate: timestamp('last_streak_update').defaultNow().notNull(),
})

// Food entries table - stores all food logs with images
export const foodEntries = pgTable('food_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  
  // Food details
  foodName: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  
  // Image storage (Cloudinary or S3 URL)
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  
  // AI Analysis results
  confidence: varchar('confidence', { length: 50 }),
  cuisine: varchar('cuisine', { length: 100 }),
  portionSize: varchar('portion_size', { length: 100 }),
  ingredients: jsonb('ingredients').$type<string[]>(),
  cookingMethod: varchar('cooking_method', { length: 100 }),
  
  // Nutritional info
  nutrients: jsonb('nutrients').$type<{
    protein: string
    carbs: string
    fat: string
    fiber: string
    sugar?: string
    sodium?: string
  }>(),
  
  // Additional metadata
  healthScore: varchar('health_score', { length: 50 }),
  allergens: jsonb('allergens').$type<string[]>(),
  alternatives: text('alternatives'),
  mealType: varchar('meal_type', { length: 50 }), // breakfast, lunch, dinner, snack
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Leaderboard cache table - for performance
export const leaderboardCache = pgTable('leaderboard_cache', {
  id: serial('id').primaryKey(),
  timeframe: varchar('timeframe', { length: 20 }).notNull(), // daily, weekly, monthly, alltime
  rank: integer('rank').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  totalXP: integer('total_xp').notNull(),
  totalCalories: integer('total_calories').notNull(),
  level: integer('level').notNull(),
  streak: integer('streak').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User sessions table - for World ID authentication
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  nonce: varchar('nonce', { length: 255 }).notNull(),
  siweMessage: text('siwe_message'),
  signature: text('signature'),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Achievements table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  achievementType: varchar('achievement_type', { length: 100 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  xpReward: integer('xp_reward').default(0),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
})

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  theme: varchar('theme', { length: 20 }).default('light'),
  notifications: boolean('notifications').default(true),
  units: varchar('units', { length: 20 }).default('metric'),
  language: varchar('language', { length: 10 }).default('en'),
  dailyCalorieGoal: integer('daily_calorie_goal').default(2000),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type FoodEntry = typeof foodEntries.$inferSelect
export type NewFoodEntry = typeof foodEntries.$inferInsert
export type LeaderboardEntry = typeof leaderboardCache.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Achievement = typeof achievements.$inferSelect
export type UserPreference = typeof userPreferences.$inferSelect
