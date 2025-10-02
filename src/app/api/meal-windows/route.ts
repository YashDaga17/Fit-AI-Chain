import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { MealWindow, MealTrackingStatus } from '@/types/teams'

// Get meal windows and current status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const stakeId = searchParams.get('stakeId')
    const checkStatus = searchParams.get('status') === 'true'

    const client = await pool.connect()

    try {
      // Get meal windows
      const windowsQuery = `
        SELECT * FROM meal_windows 
        WHERE is_active = true
        ORDER BY start_hour
      `
      const windowsResult = await client.query(windowsQuery)
      const windows = windowsResult.rows

      if (!checkStatus) {
        return NextResponse.json({
          success: true,
          data: windows
        })
      }

      // Get current meal tracking status
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const today = now.toISOString().split('T')[0]

      const mealStatuses: MealTrackingStatus[] = []

      for (const window of windows) {
        const windowStart = new Date(now)
        windowStart.setHours(window.start_hour, window.start_minute, 0, 0)
        
        const windowEnd = new Date(now)
        windowEnd.setHours(window.end_hour, window.end_minute, 0, 0)

        const isActive = now >= windowStart && now <= windowEnd

        let currentImages = 0
        if (userId) {
          // Count images submitted for this meal window today
          const imagesQuery = `
            SELECT COUNT(*) as count
            FROM food_entries
            WHERE user_id = $1 AND meal_type = $2 
            AND DATE(created_at) = $3
            ${stakeId ? 'AND stake_id = $4' : ''}
          `
          const queryParams = [userId, window.meal_type, today]
          if (stakeId) queryParams.push(stakeId)

          const imagesResult = await client.query(imagesQuery, queryParams)
          currentImages = parseInt(imagesResult.rows[0].count)
        }

        const timeRemaining = isActive ? windowEnd.getTime() - now.getTime() : 0

        mealStatuses.push({
          meal_type: window.meal_type,
          is_active: isActive,
          window_start: windowStart.toISOString(),
          window_end: windowEnd.toISOString(),
          min_images: window.min_images,
          current_images: currentImages,
          can_submit: isActive && currentImages < window.min_images,
          time_remaining: timeRemaining > 0 ? timeRemaining : undefined
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          windows,
          status: mealStatuses
        }
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Meal windows fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch meal windows',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Update meal window settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { meal_type, start_hour, start_minute, end_hour, end_minute, min_images } = await request.json()

    if (!meal_type || start_hour === undefined || end_hour === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      const updateQuery = `
        UPDATE meal_windows 
        SET start_hour = $1, start_minute = $2, end_hour = $3, end_minute = $4, min_images = $5
        WHERE meal_type = $6 AND is_active = true
        RETURNING *
      `
      
      const result = await client.query(updateQuery, [
        start_hour, start_minute || 0, end_hour, end_minute || 0, min_images || 2, meal_type
      ])

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Meal window not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Meal window updated successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Meal window update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update meal window',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
