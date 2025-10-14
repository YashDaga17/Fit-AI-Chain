-- Migration to fix food_entries table column types
-- From numeric to proper text/varchar types

-- Create a backup of the table first
CREATE TABLE food_entries_backup AS SELECT * FROM food_entries;

-- Drop and recreate the table with correct column types
DROP TABLE IF EXISTS food_entries;

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
	"portion_size" text,
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

-- Add foreign key constraint
ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- If you had data in the backup, you could restore it here with proper type casting
-- INSERT INTO food_entries SELECT * FROM food_entries_backup;

-- Drop the backup table (uncomment if you want to keep it)
-- DROP TABLE food_entries_backup;
