CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"achievement_type" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"xp_reward" integer DEFAULT 0,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"username" varchar(100) NOT NULL,
	"food_name" text NOT NULL,
	"calories" integer NOT NULL,
	"xp_earned" integer NOT NULL,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"confidence" varchar(50),
	"cuisine" varchar(100),
	"portion_size" varchar(100),
	"ingredients" jsonb,
	"cooking_method" varchar(100),
	"nutrients" jsonb,
	"health_score" varchar(50),
	"allergens" jsonb,
	"alternatives" text,
	"meal_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"timeframe" varchar(20) NOT NULL,
	"rank" integer NOT NULL,
	"user_id" integer NOT NULL,
	"username" varchar(100) NOT NULL,
	"total_xp" integer NOT NULL,
	"total_calories" integer NOT NULL,
	"level" integer NOT NULL,
	"streak" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"username" varchar(100) NOT NULL,
	"nonce" varchar(255) NOT NULL,
	"siwe_message" text,
	"signature" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"theme" varchar(20) DEFAULT 'light',
	"notifications" boolean DEFAULT true,
	"units" varchar(20) DEFAULT 'metric',
	"language" varchar(10) DEFAULT 'en',
	"daily_calorie_goal" integer DEFAULT 2000,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"total_calories" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak" integer DEFAULT 1 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_active" timestamp DEFAULT now() NOT NULL,
	"last_streak_update" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_cache" ADD CONSTRAINT "leaderboard_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;