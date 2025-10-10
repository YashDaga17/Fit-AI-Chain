import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'

// Only configure WebSocket in Node.js environment
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

// Create connection pool with error handling
const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Handle pool errors
pool.on('error', (err: any) => {
  console.error('Unexpected database pool error:', err)
})

// Create drizzle instance
export const db = drizzle(pool)

// Export pool for direct queries if needed
export { pool }
