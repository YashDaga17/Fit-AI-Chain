CREATE TABLE "exercise_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"username" varchar(100) NOT NULL,
	"exercise_name" varchar(200) NOT NULL,
	"duration" integer NOT NULL,
	"calories_burned" integer NOT NULL,
	"intensity" varchar(20) DEFAULT 'medium',
	"category" varchar(50),
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "protein_goal" integer DEFAULT 120;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "carbs_goal" integer DEFAULT 220;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "fat_goal" integer DEFAULT 70;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "fiber_goal" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;