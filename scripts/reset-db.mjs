import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

async function resetDatabase() {
  const client = new Client({
    connectionString: envVars.DATABASE_URL,
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!')

    console.log('🗑️  Dropping all tables...')
    await client.query(`
      DROP TABLE IF EXISTS achievements CASCADE;
      DROP TABLE IF EXISTS user_preferences CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS leaderboard_cache CASCADE;
      DROP TABLE IF EXISTS food_entries CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `)
    console.log('✅ Tables dropped!')

    console.log('🎉 Database reset complete! Now run: pnpm db:push')
  } catch (error) {
    console.error('❌ Reset failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

resetDatabase()
