import { NextRequest, NextResponse } from 'next/server'
import { upsertUser, createFoodEntry, getFoodEntriesByUsername } from '@/lib/db-utils'

/**
 * GET /api/food-logs?username=xxx
 * Get all food logs for a user by username
 */
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username')
    
    if (!username) {
      return NextResponse.json({ success: false, message: "Missing username" }, { status: 400 })
    }
    
    const logs = await getFoodEntriesByUsername(username)
    
    return NextResponse.json({ success: true, logs })
  } catch (error) {
    console.error('❌ Error retrieving food logs:', error)
    return NextResponse.json({ success: false, message: "Failed to retrieve food logs" }, { status: 500 })
  }
}

/**
 * POST /api/food-logs
 * Save a new food log entry
 */
export async function POST(req: NextRequest) {
  try {
    const { username, foodLog } = await req.json()
    
    if (!username || !foodLog) {
      return NextResponse.json({ success: false, message: "Missing username or foodLog" }, { status: 400 })
    }
    
    // Ensure user exists
    const user = await upsertUser(username)
    
    // Create food entry with proper error handling
    const newEntry = await createFoodEntry({
      userId: user.id,
      username,
      foodName: foodLog.food || 'Unknown Food',
      calories: foodLog.calories || 0,
      xpEarned: foodLog.xp || 0,
      imageUrl: foodLog.image || '',
      confidence: foodLog.confidence,
      cuisine: foodLog.cuisine,
      portionSize: foodLog.portionSize,
      ingredients: foodLog.ingredients,
      cookingMethod: foodLog.cookingMethod,
      nutrients: foodLog.nutrients,
      healthScore: foodLog.healthScore,
      allergens: foodLog.allergens,
      alternatives: foodLog.alternatives
    })
    
    return NextResponse.json({ success: true, log: newEntry })
  } catch (error: any) {
    console.error('❌ Error saving food log:', error.message || error)
    
    // Return more specific error messages
    if (error.message?.includes('connection')) {
      return NextResponse.json({ 
        success: false, 
        message: "Database connection failed. Please try again." 
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to save food log" 
    }, { status: 500 })
  }
}
