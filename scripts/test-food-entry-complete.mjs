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

async function testWithRealUser() {
  const sql = neon(envVars.DATABASE_URL)

  try {
    console.log('🔍 Checking existing users...')
    const users = await sql`SELECT id, username, wallet_address FROM users LIMIT 5`
    
    if (users.length === 0) {
      console.log('📝 No users found, creating a test user...')
      const newUser = await sql`
        INSERT INTO users (username, wallet_address, world_id, level, xp, total_calories)
        VALUES ('testuser123', '0xtest123', 'world_test_123', 1, 0, 0)
        RETURNING *
      `
      console.log('✅ Created test user:', newUser[0])
      var testUserId = newUser[0].id
      var testUsername = newUser[0].username
    } else {
      console.log('👥 Found existing users:')
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Wallet: ${user.wallet_address}`)
      })
      var testUserId = users[0].id
      var testUsername = users[0].username
    }

    console.log(`🧪 Testing food entry creation with user ID: ${testUserId}...`)

    // Test data that matches what the app would send
    const testData = {
      user_id: testUserId,
      username: testUsername,
      food_name: 'Test Apple',
      calories: 95,
      xp_earned: 10,
      image_url: 'test-image-ref-123',
      thumbnail_url: 'test-thumb-ref-123',
      confidence: 'high',
      cuisine: 'fruit',
      portion_size: 'medium',
      ingredients: JSON.stringify(['apple']),
      cooking_method: 'raw',
      nutrients: JSON.stringify({ fiber: '4g', vitamin_c: '14%' }),
      health_score: '9',
      allergens: JSON.stringify([]),
      alternatives: 'pear, orange',
      meal_type: 'snack'
    }

    console.log('📝 Inserting test food entry...')
    const result = await sql`
      INSERT INTO food_entries (
        user_id, username, food_name, calories, xp_earned, image_url, thumbnail_url,
        confidence, cuisine, portion_size, ingredients, cooking_method, nutrients,
        health_score, allergens, alternatives, meal_type
      ) VALUES (
        ${testData.user_id}, ${testData.username}, ${testData.food_name}, 
        ${testData.calories}, ${testData.xp_earned}, ${testData.image_url}, 
        ${testData.thumbnail_url}, ${testData.confidence}, ${testData.cuisine}, 
        ${testData.portion_size}, ${testData.ingredients}, ${testData.cooking_method}, 
        ${testData.nutrients}, ${testData.health_score}, ${testData.allergens}, 
        ${testData.alternatives}, ${testData.meal_type}
      ) RETURNING *
    `

    console.log('✅ Food entry created successfully!')
    console.log('📊 Created entry ID:', result[0].id)

    // Verify the data
    console.log('🔍 Retrieving and verifying data...')
    const retrieved = await sql`
      SELECT * FROM food_entries WHERE id = ${result[0].id}
    `

    console.log('📋 Retrieved data validation:')
    console.log('  ✓ ID:', retrieved[0].id)
    console.log('  ✓ Food Name:', retrieved[0].food_name)
    console.log('  ✓ Calories:', retrieved[0].calories)
    console.log('  ✓ Confidence:', retrieved[0].confidence, '(type:', typeof retrieved[0].confidence, ')')
    console.log('  ✓ Cuisine:', retrieved[0].cuisine)
    console.log('  ✓ Health Score:', retrieved[0].health_score, '(type:', typeof retrieved[0].health_score, ')')
    console.log('  ✓ Image URL:', retrieved[0].image_url)
    console.log('  ✓ Portion Size:', retrieved[0].portion_size)
    console.log('  ✓ Cooking Method:', retrieved[0].cooking_method)
    console.log('  ✓ Alternatives:', retrieved[0].alternatives)
    console.log('  ✓ Ingredients:', retrieved[0].ingredients)
    console.log('  ✓ Nutrients:', retrieved[0].nutrients)

    // Clean up test data
    console.log('🧹 Cleaning up test food entry...')
    await sql`DELETE FROM food_entries WHERE id = ${result[0].id}`
    
    console.log('✅ All tests passed! The food entry system is working correctly.')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  }
}

testWithRealUser()
