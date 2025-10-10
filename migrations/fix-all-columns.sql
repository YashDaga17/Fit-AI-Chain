-- Comprehensive fix for all column type issues

-- Fix ingredients column (text[] array to jsonb)
DO $$ 
BEGIN
    RAISE NOTICE 'Converting ingredients from text[] to jsonb...';
    
    -- Convert text[] array to jsonb
    ALTER TABLE food_entries 
    ALTER COLUMN ingredients TYPE jsonb USING 
        CASE 
            WHEN ingredients IS NULL THEN '[]'::jsonb
            ELSE to_jsonb(ingredients)
        END;
    
    RAISE NOTICE 'Ingredients converted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Ingredients error: %', SQLERRM;
END $$;

-- Fix allergens column (text[] array to jsonb)
DO $$ 
BEGIN
    RAISE NOTICE 'Converting allergens from text[] to jsonb...';
    
    ALTER TABLE food_entries 
    ALTER COLUMN allergens TYPE jsonb USING 
        CASE 
            WHEN allergens IS NULL THEN '[]'::jsonb
            ELSE to_jsonb(allergens)
        END;
    
    RAISE NOTICE 'Allergens converted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Allergens error: %', SQLERRM;
END $$;

-- Fix username column (integer to varchar)
DO $$ 
BEGIN
    RAISE NOTICE 'Converting username from integer to varchar...';
    
    ALTER TABLE food_entries 
    ALTER COLUMN username TYPE varchar(100) USING CAST(username AS varchar(100));
    
    ALTER TABLE food_entries 
    ALTER COLUMN username SET NOT NULL;
    
    RAISE NOTICE 'Username converted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Username error: %', SQLERRM;
END $$;

-- Fix health_score column (integer to varchar)
DO $$ 
BEGIN
    RAISE NOTICE 'Converting health_score from integer to varchar...';
    
    ALTER TABLE food_entries 
    ALTER COLUMN health_score TYPE varchar(50) USING CAST(health_score AS varchar(50));
    
    RAISE NOTICE 'Health_score converted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Health_score error: %', SQLERRM;
END $$;

-- Fix thumbnail_url column (timestamp to text)
DO $$ 
BEGIN
    RAISE NOTICE 'Converting thumbnail_url from timestamp to text...';
    
    ALTER TABLE food_entries 
    ALTER COLUMN thumbnail_url TYPE text USING CAST(thumbnail_url AS text);
    
    ALTER TABLE food_entries 
    ALTER COLUMN thumbnail_url DROP DEFAULT;
    
    RAISE NOTICE 'Thumbnail_url converted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Thumbnail_url error: %', SQLERRM;
END $$;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add image_url if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_entries' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE food_entries ADD COLUMN image_url text;
    END IF;
    
    -- Add nutrients if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_entries' AND column_name = 'nutrients'
    ) THEN
        ALTER TABLE food_entries ADD COLUMN nutrients jsonb;
    END IF;
    
    -- Add meal_type if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_entries' AND column_name = 'meal_type'
    ) THEN
        ALTER TABLE food_entries ADD COLUMN meal_type varchar(50);
    END IF;
    
    -- Add created_at if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_entries' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE food_entries ADD COLUMN created_at timestamp DEFAULT now() NOT NULL;
    END IF;
    
    -- Add updated_at if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_entries' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE food_entries ADD COLUMN updated_at timestamp DEFAULT now() NOT NULL;
    END IF;
END $$;

-- Display final schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'food_entries' 
ORDER BY ordinal_position;
