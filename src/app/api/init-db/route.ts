import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, testConnection } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Test connection first
    const connectionTest = await testConnection()
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database'
      }, { status: 500 })
    }

    // Initialize database tables
    await initializeDatabase()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const connectionTest = await testConnection()
    
    return NextResponse.json({
      success: connectionTest,
      message: connectionTest ? 'Database connection successful' : 'Database connection failed'
    })

  } catch (error) {
    console.error('Database connection test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test database connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
