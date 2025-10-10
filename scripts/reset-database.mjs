import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables manually
const envPath = path.join(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const sql = neon(envVars.DATABASE_URL);

async function resetDatabase() {
  console.log('🔄 Resetting database - dropping all tables...\n');
  
  try {
    // Drop all tables in correct order (respecting foreign keys)
    console.log('Dropping existing tables...');
    
    await sql`DROP TABLE IF EXISTS user_preferences CASCADE`;
    console.log('✅ Dropped user_preferences');
    
    await sql`DROP TABLE IF EXISTS sessions CASCADE`;
    console.log('✅ Dropped sessions');
    
    await sql`DROP TABLE IF EXISTS leaderboard_cache CASCADE`;
    console.log('✅ Dropped leaderboard_cache');
    
    await sql`DROP TABLE IF EXISTS achievements CASCADE`;
    console.log('✅ Dropped achievements');
    
    await sql`DROP TABLE IF EXISTS food_entries CASCADE`;
    console.log('✅ Dropped food_entries');
    
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('✅ Dropped users');
    
    console.log('\n📝 All tables dropped successfully!');
    console.log('\n🏗️  Now creating fresh tables with correct schema...\n');
    
    // Create users table
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        level INTEGER DEFAULT 1 NOT NULL,
        xp INTEGER DEFAULT 0 NOT NULL,
        streak INTEGER DEFAULT 0 NOT NULL,
        last_streak_update TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created users table');
    
    // Create food_entries table
    await sql`
      CREATE TABLE food_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        username VARCHAR(100) NOT NULL,
        food_name VARCHAR(200) NOT NULL,
        calories INTEGER NOT NULL,
        protein NUMERIC(10, 2) NOT NULL,
        carbs NUMERIC(10, 2) NOT NULL,
        fats NUMERIC(10, 2) NOT NULL,
        fiber NUMERIC(10, 2) DEFAULT 0,
        sugar NUMERIC(10, 2) DEFAULT 0,
        sodium NUMERIC(10, 2) DEFAULT 0,
        ingredients JSONB DEFAULT '[]'::jsonb,
        allergens JSONB DEFAULT '[]'::jsonb,
        health_score VARCHAR(50),
        image_url TEXT NOT NULL,
        thumbnail_url TEXT,
        nutrients JSONB,
        meal_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created food_entries table');
    
    // Create achievements table
    await sql`
      CREATE TABLE achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        xp_reward INTEGER DEFAULT 0,
        unlocked_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created achievements table');
    
    // Create leaderboard_cache table
    await sql`
      CREATE TABLE leaderboard_cache (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        username VARCHAR(100) NOT NULL,
        level INTEGER NOT NULL,
        xp INTEGER NOT NULL,
        streak INTEGER NOT NULL,
        rank INTEGER NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created leaderboard_cache table');
    
    // Create sessions table
    await sql`
      CREATE TABLE sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created sessions table');
    
    // Create user_preferences table
    await sql`
      CREATE TABLE user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        theme VARCHAR(20) DEFAULT 'light',
        notifications_enabled BOOLEAN DEFAULT true,
        daily_calorie_goal INTEGER DEFAULT 2000,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created user_preferences table');
    
    // Create indexes for better performance
    await sql`CREATE INDEX idx_food_entries_user_id ON food_entries(user_id)`;
    await sql`CREATE INDEX idx_food_entries_username ON food_entries(username)`;
    await sql`CREATE INDEX idx_food_entries_created_at ON food_entries(created_at)`;
    await sql`CREATE INDEX idx_achievements_user_id ON achievements(user_id)`;
    await sql`CREATE INDEX idx_sessions_user_id ON sessions(user_id)`;
    await sql`CREATE INDEX idx_sessions_token ON sessions(session_token)`;
    console.log('✅ Created indexes');
    
    console.log('\n✅ Database reset completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('   1. users');
    console.log('   2. food_entries');
    console.log('   3. achievements');
    console.log('   4. leaderboard_cache');
    console.log('   5. sessions');
    console.log('   6. user_preferences');
    
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Test the app and create a new user');
    console.log('   3. Test adding food logs');
    
  } catch (error) {
    console.error('\n❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
