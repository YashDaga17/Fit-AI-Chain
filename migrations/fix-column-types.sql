-- Fix column types for existing database
-- This handles casting columns that can't be automatically converted

-- Fix total_calories in users table
DO $$ 
BEGIN
    -- Try to alter the column type with explicit casting
    ALTER TABLE users 
    ALTER COLUMN total_calories TYPE integer USING total_calories::integer;
    
    RAISE NOTICE 'Fixed total_calories column type';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'total_calories error: %', SQLERRM;
END $$;

-- Fix xp_earned in food_entries table
DO $$ 
BEGIN
    ALTER TABLE food_entries 
    ALTER COLUMN xp_earned TYPE integer USING xp_earned::integer;
    
    RAISE NOTICE 'Fixed xp_earned column type';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'xp_earned error: %', SQLERRM;
END $$;

-- Make last_streak_update NOT NULL with default
DO $$ 
BEGIN
    -- First set NULL values to NOW()
    UPDATE users 
    SET last_streak_update = NOW() 
    WHERE last_streak_update IS NULL;
    
    -- Then make it NOT NULL
    ALTER TABLE users 
    ALTER COLUMN last_streak_update SET NOT NULL;
    
    RAISE NOTICE 'Fixed last_streak_update to NOT NULL';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'last_streak_update error: %', SQLERRM;
END $$;

-- Fix varchar column lengths
DO $$ 
BEGIN
    ALTER TABLE leaderboard_cache ALTER COLUMN timeframe SET DATA TYPE varchar(20);
    ALTER TABLE user_preferences ALTER COLUMN units SET DATA TYPE varchar(20);
    ALTER TABLE user_preferences ALTER COLUMN units SET DEFAULT 'metric';
    ALTER TABLE sessions ALTER COLUMN username SET DATA TYPE varchar(100);
    ALTER TABLE food_entries ALTER COLUMN confidence SET DATA TYPE varchar(50);
    ALTER TABLE food_entries ALTER COLUMN confidence DROP NOT NULL;
    ALTER TABLE food_entries ALTER COLUMN cuisine SET DATA TYPE varchar(100);
    ALTER TABLE food_entries ALTER COLUMN cuisine DROP NOT NULL;
    ALTER TABLE food_entries ALTER COLUMN portion_size SET DATA TYPE varchar(100);
    ALTER TABLE food_entries ALTER COLUMN portion_size DROP DEFAULT;
    ALTER TABLE food_entries ALTER COLUMN cooking_method SET DATA TYPE varchar(100);
    ALTER TABLE food_entries ALTER COLUMN cooking_method DROP DEFAULT;
    ALTER TABLE food_entries ALTER COLUMN alternatives SET DATA TYPE text;
    ALTER TABLE food_entries ALTER COLUMN alternatives DROP DEFAULT;
    
    RAISE NOTICE 'Fixed varchar column lengths';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'varchar columns error: %', SQLERRM;
END $$;
