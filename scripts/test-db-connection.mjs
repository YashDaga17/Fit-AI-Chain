import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
const envPath = path.join(__dirname, '..', '.env.local');

if (!readFileSync) {
  console.error('❌ Cannot read .env.local file');
  process.exit(1);
}

let envVars = {};
try {
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
} catch (error) {
  console.error('❌ Could not read .env.local file. Make sure it exists and run:');
  console.error('   cp .env.example .env.local');
  process.exit(1);
}

if (!envVars.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.error('   Add your NeonDB connection string to .env.local');
  process.exit(1);
}

console.log('🔍 Testing database connection...');
console.log('📊 Database URL:', envVars.DATABASE_URL.replace(/:\/\/[^@]+@/, '://***:***@'));

const sql = neon(envVars.DATABASE_URL);

async function testConnection() {
  try {
    console.log('\n⏳ Connecting to database...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    
    console.log('✅ Database connection successful!');
    console.log('🕐 Server time:', result[0].current_time);
    console.log('📊 Database version:', result[0].db_version.split(' ')[0]);
    
    // Test if our tables exist
    console.log('\n🔍 Checking for application tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'food_entries', 'sessions')
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No application tables found');
      console.log('   Run: pnpm run db:push');
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name).join(', '));
      
      // Check users table for any data
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log('👥 Users in database:', userCount[0].count);
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('   Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Possible fixes:');
      console.error('   - Check your username/password in DATABASE_URL');
      console.error('   - Verify database credentials in NeonDB dashboard');
    } else if (error.message.includes('connection timed out')) {
      console.error('\n💡 Possible fixes:');
      console.error('   - Database may be sleeping (NeonDB free tier)');
      console.error('   - Check your internet connection');
      console.error('   - Verify the host address in DATABASE_URL');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 Possible fixes:');
      console.error('   - Check database name in DATABASE_URL');
      console.error('   - Create database in NeonDB dashboard');
    }
    
    process.exit(1);
  }
}

testConnection();
