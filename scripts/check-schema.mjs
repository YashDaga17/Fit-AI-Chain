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

async function checkSchema() {
  const sql = neon(envVars.DATABASE_URL)

  try {
    console.log('🔍 Checking food_entries table schema...')
    
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'food_entries' 
      ORDER BY ordinal_position
    `
    
    console.log('📊 Current food_entries schema:')
    columns.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : ''
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
      console.log(`  - ${col.column_name}: ${col.data_type}${length} ${nullable}`)
    })
    
    // Specifically check image_url column
    const imageUrlCol = columns.find(col => col.column_name === 'image_url')
    if (imageUrlCol) {
      console.log('\n🖼️  Image URL column details:')
      console.log(`   Type: ${imageUrlCol.data_type}`)
      console.log(`   Max Length: ${imageUrlCol.character_maximum_length || 'unlimited'}`)
      console.log(`   Can store base64: ${imageUrlCol.data_type === 'text' ? '✅ YES' : '❌ NO'}`)
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message)
    process.exit(1)
  }
}

checkSchema()
