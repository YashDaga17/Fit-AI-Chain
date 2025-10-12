import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'

// Only configure WebSocket in Node.js environment
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const connectionString = process.env.DATABASE_URL

let db: any = null
let pool: any = null
let isDatabaseConnected = false

// Better error handling for missing database URL
if (!connectionString) {
  
  if (process.env.NODE_ENV === 'development') {
    db = null
    pool = null
    isDatabaseConnected = false
  } else {
    throw new Error('DATABASE_URL is required in production')
  }
} else {
  try {
    // Create connection pool with error handling
    pool = new Pool({ 
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

    // Handle pool errors
    pool.on('error', (err: any) => {
      console.error('Unexpected database pool error:', err)
    })

    // Test connection
    pool.query('SELECT 1').then(() => {
      console.log('✅ Database connected successfully')
    }).catch((err: any) => {
      console.error('❌ Database connection failed:', err.message)
    })

    // Create drizzle instance
    db = drizzle(pool)
    isDatabaseConnected = true

  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    db = null
    pool = null
    isDatabaseConnected = false
  }
}

// Export variables
export { db, pool, isDatabaseConnected }
