import { NextRequest, NextResponse } from 'next/server'
import { upsertUser, createFoodEntry, getFoodEntriesByUsername } from '@/lib/db-utils'
import { normalizeUsername, sanitizeNutrition, sanitizePagination, sanitizeString, sanitizeStringArray, clampInteger } from '@/lib/validation'

type FoodEntryInput = Parameters<typeof createFoodEntry>[0]

/**
 * GET /api/food-logs?username=xxx
 * Get all food logs for a user by username
 */
export async function GET(req: NextRequest) {
  try {
    const username = normalizeUsername(req.nextUrl.searchParams.get('username'))
    const { limit, offset } = sanitizePagination(
      req.nextUrl.searchParams.get('limit'),
      req.nextUrl.searchParams.get('offset')
    )
    
    if (!username) {
      return NextResponse.json({ success: false, message: "Missing username" }, { status: 400 })
    }
    
    const logs = await getFoodEntriesByUsername(username, limit, offset)
    
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
    const normalizedUsername = normalizeUsername(username)
    
    if (!normalizedUsername || !foodLog || typeof foodLog !== 'object') {
      return NextResponse.json({ success: false, message: "Missing username or foodLog" }, { status: 400 })
    }
    
    // Ensure user exists
    const user = await upsertUser(normalizedUsername)
    
    // Sanitize and validate data before database insertion
    const sanitizedEntry: FoodEntryInput = {
      userId: user.id,
      username: normalizedUsername,
      foodName: sanitizeString(foodLog.food, 200) || 'Unknown Food',
      calories: clampInteger(foodLog.calories, 0, 0, 10000),
      xpEarned: clampInteger(foodLog.xp, 0, 0, 100000),
      imageUrl: sanitizeString(foodLog.image, 1024 * 1024) || '/placeholder-food.jpg',
      confidence: sanitizeString(foodLog.confidence, 50) ?? undefined,
      cuisine: sanitizeString(foodLog.cuisine, 100) ?? undefined,
      portionSize: sanitizeString(foodLog.portionSize, 100) ?? undefined,
      ingredients: sanitizeStringArray(foodLog.ingredients, 30, 100) ?? undefined,
      cookingMethod: sanitizeString(foodLog.cookingMethod, 100) ?? undefined,
      nutrients: sanitizeNutrition(foodLog.nutrients) ?? undefined,
      healthScore: sanitizeString(foodLog.healthScore, 50) ?? undefined,
      allergens: sanitizeStringArray(foodLog.allergens, 20, 100) ?? undefined,
      alternatives: sanitizeString(foodLog.alternatives, 500) ?? undefined
    }
    
    // Create food entry with proper error handling
    const newEntry = await createFoodEntry(sanitizedEntry)
    
    
    return NextResponse.json({ success: true, log: newEntry })
  } catch (error: any) {
    
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
