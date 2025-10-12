import { pgTable, unique, serial, varchar, integer, timestamp, foreignKey, text, numeric, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 100 }).notNull(),
	level: integer().default(1).notNull(),
	totalCalories: integer("total_calories").default(0).notNull(),
	streak: integer().default(1).notNull(),
	lastStreakUpdate: timestamp("last_streak_update", { mode: 'string' }).defaultNow().notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
	totalXp: integer("total_xp").default(0).notNull(),
	lastActive: timestamp("last_active", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const foodEntries = pgTable("food_entries", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	username: varchar({ length: 100 }).notNull(),
	foodName: text("food_name").notNull(),
	calories: integer().notNull(),
	xpEarned: numeric("xp_earned", { precision: 10, scale:  2 }).notNull(),
	confidence: numeric({ precision: 10, scale:  2 }).notNull(),
	cuisine: numeric({ precision: 10, scale:  2 }).notNull(),
	portionSize: numeric("portion_size", { precision: 10, scale:  2 }).default('0'),
	cookingMethod: numeric("cooking_method", { precision: 10, scale:  2 }).default('0'),
	alternatives: numeric({ precision: 10, scale:  2 }).default('0'),
	ingredients: jsonb(),
	allergens: jsonb(),
	healthScore: varchar("health_score", { length: 50 }),
	imageUrl: text("image_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	nutrients: jsonb(),
	mealType: varchar("meal_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "food_entries_user_id_users_id_fk"
		}),
]);

export const achievements = pgTable("achievements", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	icon: varchar({ length: 50 }),
	xpReward: integer("xp_reward").default(0),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }).defaultNow().notNull(),
	achievementType: varchar("achievement_type", { length: 100 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "achievements_user_id_users_id_fk"
		}),
]);

export const sessions = pgTable("sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	username: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	nonce: varchar({ length: 255 }).notNull(),
	siweMessage: text("siwe_message"),
	signature: text(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}),
]);

export const leaderboardCache = pgTable("leaderboard_cache", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	username: varchar({ length: 100 }).notNull(),
	level: integer().notNull(),
	timeframe: integer().notNull(),
	streak: integer().notNull(),
	rank: integer().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	totalXp: integer("total_xp").notNull(),
	totalCalories: integer("total_calories").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "leaderboard_cache_user_id_users_id_fk"
		}),
]);

export const userPreferences = pgTable("user_preferences", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	theme: varchar({ length: 20 }).default('light'),
	notifications: boolean().default(true),
	dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	units: varchar({ length: 20 }).default('metric'),
	language: varchar({ length: 10 }).default('en'),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_preferences_user_id_users_id_fk"
		}),
	unique("user_preferences_user_id_unique").on(table.userId),
]);
