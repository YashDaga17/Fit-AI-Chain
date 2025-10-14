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
    
    console.log('📝 Saving food log for user:', username)
    console.log('📊 Food log data:', {
      food: foodLog.food,
      calories: foodLog.calories,
      imageSize: foodLog.image?.length || 0,
      hasNutrients: !!foodLog.nutrients
    })
    
    if (!username || !foodLog) {
      return NextResponse.json({ success: false, message: "Missing username or foodLog" }, { status: 400 })
    }
    
    // Ensure user exists
    const user = await upsertUser(username)
    
    // Sanitize and validate data before database insertion
    const sanitizedEntry = {
      userId: user.id,
      username,
      foodName: foodLog.food || 'Unknown Food',
      calories: Number(foodLog.calories) || 0,
      xpEarned: Number(foodLog.xp) || 0,
      imageUrl: foodLog.image || 'placeholder.jpg',
      confidence: foodLog.confidence || null,
      cuisine: foodLog.cuisine || null,
      portionSize: foodLog.portionSize || null,
      ingredients: Array.isArray(foodLog.ingredients) ? foodLog.ingredients : null,
      cookingMethod: foodLog.cookingMethod || null,
      nutrients: foodLog.nutrients && typeof foodLog.nutrients === 'object' ? foodLog.nutrients : null,
      healthScore: foodLog.healthScore || null,
      allergens: Array.isArray(foodLog.allergens) ? foodLog.allergens : null,
      alternatives: foodLog.alternatives || null
    }
    
    // Create food entry with proper error handling
    const newEntry = await createFoodEntry(sanitizedEntry)
    
    console.log('✅ Food log saved successfully:', newEntry.id)
    
    return NextResponse.json({ success: true, log: newEntry })
  } catch (error: any) {
    console.error('❌ Food log save error:', error.message)
    console.error('Error details:', error)
    
    // Return more specific error messages
    if (error.message?.includes('connection')) {
      return NextResponse.json({ 
        success: false, 
        message: "Database connection failed. Please try again." 
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to save food log. Please try again." 
    }, { status: 500 })
  }
}
