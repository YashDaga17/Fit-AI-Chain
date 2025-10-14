import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { neon } from '@neondatabase/serverless'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local manually
const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

async function runMigration() {
  const sql = neon(envVars.DATABASE_URL)

  try {
    console.log('🔄 Running food_entries table schema fix...')

    console.log('📊 Creating backup table...')
    await sql`CREATE TABLE food_entries_backup AS SELECT * FROM food_entries`
    
    console.log('🗑️ Dropping old table...')
    await sql`DROP TABLE IF EXISTS food_entries CASCADE`
    
    console.log('🔨 Creating new table with correct types...')
    await sql`
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
      )
    `
    
    console.log('🔗 Adding foreign key constraint...')
    await sql`ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action`
    
    console.log('🗑️ Cleaning up backup table...')
    await sql`DROP TABLE food_entries_backup`
    
    console.log('✅ Migration completed successfully!')
    
    // Test the new table structure
    console.log('🔍 Testing new table structure...')
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'food_entries' 
      AND column_name IN ('confidence', 'cuisine', 'portion_size', 'cooking_method', 'alternatives')
      ORDER BY column_name
    `
    
    console.log('📊 Updated columns:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`)
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
