-- Fix ingredients column casting issue
-- This converts the ingredients column from text to jsonb properly

-- First, update any existing data to valid JSON format
UPDATE food_entries 
SET ingredients = '[]'::text 
WHERE ingredients IS NULL OR ingredients = '';

-- Now alter the column with explicit casting
ALTER TABLE food_entries 
ALTER COLUMN ingredients TYPE jsonb USING ingredients::jsonb;

-- Do the same for allergens if needed
UPDATE food_entries 
SET allergens = '[]'::text 
WHERE allergens IS NULL OR allergens = '';

ALTER TABLE food_entries 
ALTER COLUMN allergens TYPE jsonb USING allergens::jsonb;
