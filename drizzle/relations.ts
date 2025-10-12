import { relations } from "drizzle-orm/relations";
import { users, foodEntries, achievements, sessions, leaderboardCache, userPreferences } from "./schema";

export const foodEntriesRelations = relations(foodEntries, ({one}) => ({
	user: one(users, {
		fields: [foodEntries.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	foodEntries: many(foodEntries),
	achievements: many(achievements),
	sessions: many(sessions),
	leaderboardCaches: many(leaderboardCache),
	userPreferences: many(userPreferences),
}));

export const achievementsRelations = relations(achievements, ({one}) => ({
	user: one(users, {
		fields: [achievements.userId],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const leaderboardCacheRelations = relations(leaderboardCache, ({one}) => ({
	user: one(users, {
		fields: [leaderboardCache.userId],
		references: [users.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(users, {
		fields: [userPreferences.userId],
		references: [users.id]
	}),
}));