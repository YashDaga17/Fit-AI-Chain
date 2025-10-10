import { pgTable, text, timestamp, integer, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core'

/**
 * Users table - stores World App wallet information
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletAddress: text('wallet_address').notNull().unique(),
  username: text('username').notNull(),
  worldIdVerified: integer('world_id_verified').default(0), // 0 = not verified, 1 = verified
  totalXP: integer('total_xp').default(0),
  level: integer('level').default(1),
  streak: integer('streak').default(0),
  totalCalories: decimal('total_calories', { precision: 10, scale: 2 }).default('0'),
  totalEntries: integer('total_entries').default(0),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow(),
}, (table) => ({
  walletIdx: index('wallet_idx').on(table.walletAddress),
  xpIdx: index('xp_idx').on(table.totalXP),
}))

/**
 * Food entries table - stores all food logs with AI analysis
 */
export const foodEntries = pgTable('food_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  walletAddress: text('wallet_address').notNull(), // Denormalized for faster queries
  
  // Image storage
  imageUrl: text('image_url'), // URL to stored image (can be Neon blob or external storage)
  imageHash: text('image_hash'), // Hash for deduplication
  
  // AI Analysis results
  foodName: text('food_name').notNull(),
  description: text('description'),
  
  // Nutrition data
  calories: decimal('calories', { precision: 10, scale: 2 }).notNull(),
  protein: decimal('protein', { precision: 10, scale: 2 }),
  carbs: decimal('carbs', { precision: 10, scale: 2 }),
  fat: decimal('fat', { precision: 10, scale: 2 }),
  fiber: decimal('fiber', { precision: 10, scale: 2 }),
  sugar: decimal('sugar', { precision: 10, scale: 2 }),
  sodium: decimal('sodium', { precision: 10, scale: 2 }),
  
  // Gamification
  xpEarned: integer('xp_earned').default(0),
  
  // Metadata
  aiModel: text('ai_model').default('gemini'), // Track which AI model was used
  confidence: decimal('confidence', { precision: 5, scale: 2 }), // AI confidence score
  rawAnalysis: jsonb('raw_analysis'), // Store full AI response for reference
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('user_idx').on(table.userId),
  walletIdx: index('food_wallet_idx').on(table.walletAddress),
  createdIdx: index('created_idx').on(table.createdAt),
}))

/**
 * Leaderboard snapshots - daily/weekly/monthly rankings
 */
export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  walletAddress: text('wallet_address').notNull(),
  username: text('username').notNull(),
  
  // Stats at snapshot time
  totalXP: integer('total_xp').notNull(),
  level: integer('level').notNull(),
  totalCalories: decimal('total_calories', { precision: 10, scale: 2 }).notNull(),
  totalEntries: integer('total_entries').notNull(),
  rank: integer('rank').notNull(),
  
  // Snapshot metadata
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'all-time'
  snapshotDate: timestamp('snapshot_date').defaultNow(),
}, (table) => ({
  periodIdx: index('period_idx').on(table.period),
  dateIdx: index('date_idx').on(table.snapshotDate),
  rankIdx: index('rank_idx').on(table.rank),
}))

/**
 * Image storage table - for storing food images as blobs
 */
export const images = pgTable('images', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  walletAddress: text('wallet_address').notNull(),
  
  // Image data
  data: text('data').notNull(), // Base64 encoded image or URL
  mimeType: text('mime_type').default('image/jpeg'),
  size: integer('size'), // File size in bytes
  hash: text('hash'), // For deduplication
  
  // Metadata
  uploadedAt: timestamp('uploaded_at').defaultNow(),
}, (table) => ({
  userIdx: index('image_user_idx').on(table.userId),
  hashIdx: index('hash_idx').on(table.hash),
}))

/**
 * User achievements/badges
 */
export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  achievementType: text('achievement_type').notNull(), // 'first_entry', 'streak_7', 'level_10', etc.
  earnedAt: timestamp('earned_at').defaultNow(),
  
  // Achievement details
  title: text('title').notNull(),
  description: text('description'),
  xpReward: integer('xp_reward').default(0),
}, (table) => ({
  userIdx: index('achievement_user_idx').on(table.userId),
}))

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type FoodEntry = typeof foodEntries.$inferSelect
export type NewFoodEntry = typeof foodEntries.$inferInsert
export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect
export type Image = typeof images.$inferSelect
export type NewImage = typeof images.$inferInsert
export type Achievement = typeof achievements.$inferSelect
