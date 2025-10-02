// Database connection and setup for Neon PostgreSQL
import { Pool } from 'pg'

// Create connection pool to Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hxaW5SjU3rGg@ep-bitter-resonance-adb23m29-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection
export async function testConnection() {
  try {
    const client = await pool.connect()
    const res = await client.query('SELECT NOW()')
    client.release()
    console.log('Database connected successfully:', res.rows[0])
    return true
  } catch (err) {
    console.error('Database connection error:', err)
    return false
  }
}

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        wallet_address VARCHAR(100),
        nullifier_hash VARCHAR(100) UNIQUE,
        verification_type VARCHAR(20) DEFAULT 'guest',
        total_calories INTEGER DEFAULT 0,
        total_xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 1,
        level INTEGER DEFAULT 1,
        rank INTEGER DEFAULT 1,
        total_entries INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Groups table
    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_private BOOLEAN DEFAULT true,
        max_members INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Group members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, user_id)
      )
    `)
    
    // Stakes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stakes (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        competition_type VARCHAR(20) DEFAULT 'daily', -- daily, meal
        meal_type VARCHAR(20), -- breakfast, lunch, dinner
        stake_amount DECIMAL(10, 2) DEFAULT 0.0,
        total_pool DECIMAL(10, 2) DEFAULT 0.0,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
        winner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Stake participants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stake_participants (
        id SERIAL PRIMARY KEY,
        stake_id INTEGER REFERENCES stakes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        calories_tracked INTEGER DEFAULT 0,
        images_submitted INTEGER DEFAULT 0,
        is_qualified BOOLEAN DEFAULT false,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(stake_id, user_id)
      )
    `)
    
    // Food entries table (enhanced from existing structure)
    await client.query(`
      CREATE TABLE IF NOT EXISTS food_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        group_id INTEGER REFERENCES groups(id),
        stake_id INTEGER REFERENCES stakes(id),
        food_name VARCHAR(200) NOT NULL,
        calories INTEGER NOT NULL,
        xp_earned INTEGER DEFAULT 0,
        confidence VARCHAR(20),
        cuisine VARCHAR(50),
        portion_size TEXT,
        ingredients TEXT[],
        cooking_method VARCHAR(50),
        nutrients JSONB,
        health_score INTEGER,
        allergens TEXT[],
        alternatives TEXT,
        image_url TEXT NOT NULL,
        meal_type VARCHAR(20), -- breakfast, lunch, dinner, snack
        meal_window_start TIMESTAMP,
        meal_window_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Meal windows configuration table
    await client.query(`
      CREATE TABLE IF NOT EXISTS meal_windows (
        id SERIAL PRIMARY KEY,
        meal_type VARCHAR(20) NOT NULL,
        start_hour INTEGER NOT NULL, -- 0-23
        start_minute INTEGER DEFAULT 0,
        end_hour INTEGER NOT NULL, -- 0-23
        end_minute INTEGER DEFAULT 0,
        min_images INTEGER DEFAULT 2,
        is_active BOOLEAN DEFAULT true
      )
    `)
    
    // Insert default meal windows
    await client.query(`
      INSERT INTO meal_windows (meal_type, start_hour, start_minute, end_hour, end_minute, min_images) 
      VALUES 
        ('breakfast', 8, 0, 10, 0, 2),
        ('lunch', 14, 0, 16, 0, 2),
        ('dinner', 20, 0, 22, 0, 2)
      ON CONFLICT DO NOTHING
    `)
    
    // User stats history for tracking progress
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        calories INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0,
        entries_count INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `)
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_nullifier ON users(nullifier_hash);
      CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
      CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_stakes_group ON stakes(group_id);
      CREATE INDEX IF NOT EXISTS idx_stakes_status ON stakes(status);
      CREATE INDEX IF NOT EXISTS idx_stake_participants_stake ON stake_participants(stake_id);
      CREATE INDEX IF NOT EXISTS idx_food_entries_user ON food_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_food_entries_group ON food_entries(group_id);
      CREATE INDEX IF NOT EXISTS idx_food_entries_stake ON food_entries(stake_id);
      CREATE INDEX IF NOT EXISTS idx_food_entries_created ON food_entries(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_stats_history_user_date ON user_stats_history(user_id, date);
    `)
    
    await client.query('COMMIT')
    console.log('Database tables initialized successfully')
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error initializing database:', error)
    throw error
  } finally {
    client.release()
  }
}

export { pool }
export default pool
