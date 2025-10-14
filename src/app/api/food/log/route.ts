import { NextRequest, NextResponse } from 'next/server'
import { createFoodEntry, getUserByUsername, getFoodEntriesByUsername } from '@/lib/db-utils'
import type { FoodEntry } from '@/lib/db/schema'

/**
 * POST /api/food/log
 * Save food entry with image to database
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      username,
      foodName,
      calories,
      xpEarned,
      imageUrl, // Cloudinary or external image URL
      thumbnailUrl,
      confidence,
      cuisine,
      portionSize,
      ingredients,
      cookingMethod,
      nutrients,
      healthScore,
      allergens,
      alternatives,
      mealType,
    } = body

    if (!username || !foodName || !calories) {
      return NextResponse.json(
        { error: 'Missing required fields: username, foodName, calories' },
        { status: 400 }
      )
    }

    // Get user
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create food entry
    const entry = await createFoodEntry({
      userId: user.id,
      username,
      foodName,
      calories: Number(calories),
      xpEarned: Number(xpEarned || 0),
      imageUrl: imageUrl || '',
      thumbnailUrl,
      confidence,
      cuisine,
      portionSize,
      ingredients,
      cookingMethod,
      nutrients,
      healthScore,
      allergens,
      alternatives,
      mealType,
    })

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        foodName: entry.foodName,
        calories: entry.calories,
        xpEarned: entry.xpEarned,
        imageUrl: entry.imageUrl,
        createdAt: entry.createdAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to log food', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/food/log?username=...&limit=50
 * Get food entries for a user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const entries = await getFoodEntriesByUsername(username, limit, offset)

    return NextResponse.json({
      success: true,
      entries: entries.map((entry: FoodEntry) => ({
        id: entry.id,
        foodName: entry.foodName,
        calories: entry.calories,
        xpEarned: entry.xpEarned,
        imageUrl: entry.imageUrl,
        cuisine: entry.cuisine,
        mealType: entry.mealType,
        createdAt: entry.createdAt,
      })),
      count: entries.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get food entries', details: error.message },
      { status: 500 }
    )
  }
}
