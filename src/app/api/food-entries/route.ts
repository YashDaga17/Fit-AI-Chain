import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { EnhancedFoodEntry } from '@/types/teams'

// Create enhanced food entry
export async function POST(request: NextRequest) {
  try {
    const {
      user_id,
      group_id,
      stake_id,
      food_name,
      calories,
      xp_earned,
      confidence,
      cuisine,
      portion_size,
      ingredients,
      cooking_method,
      nutrients,
      health_score,
      allergens,
      alternatives,
      image_url,
      meal_type
    } = await request.json()

    if (!user_id || !food_name || !calories || !image_url) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Determine meal window if meal_type is provided
      let mealWindowStart = null
      let mealWindowEnd = null

      if (meal_type && ['breakfast', 'lunch', 'dinner'].includes(meal_type)) {
        const mealWindowQuery = `
          SELECT start_hour, start_minute, end_hour, end_minute
          FROM meal_windows 
          WHERE meal_type = $1 AND is_active = true
        `
        const mealWindow = await client.query(mealWindowQuery, [meal_type])
        
        if (mealWindow.rows.length > 0) {
          const window = mealWindow.rows[0]
          const today = new Date()
          
          const startTime = new Date(today)
          startTime.setHours(window.start_hour, window.start_minute, 0, 0)
          
          const endTime = new Date(today)
          endTime.setHours(window.end_hour, window.end_minute, 0, 0)
          
          mealWindowStart = startTime.toISOString()
          mealWindowEnd = endTime.toISOString()
        }
      }

      // Insert food entry
      const entryQuery = `
        INSERT INTO food_entries (
          user_id, group_id, stake_id, food_name, calories, xp_earned,
          confidence, cuisine, portion_size, ingredients, cooking_method,
          nutrients, health_score, allergens, alternatives, image_url,
          meal_type, meal_window_start, meal_window_end
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `
      
      const entryResult = await client.query(entryQuery, [
        user_id, group_id, stake_id, food_name, calories, xp_earned,
        confidence, cuisine, portion_size, ingredients, cooking_method,
        JSON.stringify(nutrients), health_score, allergens, alternatives, image_url,
        meal_type, mealWindowStart, mealWindowEnd
      ])

      const foodEntry = entryResult.rows[0]

      // Update user stats
      await client.query(`
        UPDATE users 
        SET total_calories = total_calories + $1,
            total_xp = total_xp + $2,
            total_entries = total_entries + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [calories, xp_earned, user_id])

      // Update stake participant if applicable
      if (stake_id) {
        // Check if this is within a valid meal window or daily competition
        const currentTime = new Date()
        const isValidSubmission = !mealWindowStart || 
          (mealWindowStart && mealWindowEnd && 
           currentTime >= new Date(mealWindowStart) && currentTime <= new Date(mealWindowEnd))

        if (isValidSubmission) {
          await client.query(`
            UPDATE stake_participants 
            SET calories_tracked = calories_tracked + $1,
                images_submitted = images_submitted + 1
            WHERE stake_id = $2 AND user_id = $3
          `, [calories, stake_id, user_id])

          // Check qualification (minimum images requirement)
          if (meal_type) {
            const minImagesQuery = `
              SELECT min_images FROM meal_windows 
              WHERE meal_type = $1 AND is_active = true
            `
            const minImagesResult = await client.query(minImagesQuery, [meal_type])
            
            if (minImagesResult.rows.length > 0) {
              const minImages = minImagesResult.rows[0].min_images
              
              // Count images for this meal window
              const imagesCountQuery = `
                SELECT COUNT(*) as count
                FROM food_entries
                WHERE stake_id = $1 AND user_id = $2 AND meal_type = $3
                AND created_at >= $4 AND created_at <= $5
              `
              const imagesCount = await client.query(imagesCountQuery, [
                stake_id, user_id, meal_type, mealWindowStart, mealWindowEnd
              ])

              if (parseInt(imagesCount.rows[0].count) >= minImages) {
                await client.query(`
                  UPDATE stake_participants 
                  SET is_qualified = true
                  WHERE stake_id = $1 AND user_id = $2
                `, [stake_id, user_id])
              }
            }
          }
        }
      }

      // Update daily stats history
      const today = new Date().toISOString().split('T')[0]
      await client.query(`
        INSERT INTO user_stats_history (user_id, date, calories, xp_earned, entries_count)
        VALUES ($1, $2, $3, $4, 1)
        ON CONFLICT (user_id, date)
        DO UPDATE SET 
          calories = user_stats_history.calories + $3,
          xp_earned = user_stats_history.xp_earned + $4,
          entries_count = user_stats_history.entries_count + 1
      `, [user_id, today, calories, xp_earned])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        data: foodEntry,
        message: 'Food entry created successfully'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Food entry creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create food entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get food entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const groupId = searchParams.get('groupId')
    const stakeId = searchParams.get('stakeId')
    const mealType = searchParams.get('mealType')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')

    const client = await pool.connect()

    try {
      let query = `
        SELECT fe.*, u.username
        FROM food_entries fe
        JOIN users u ON fe.user_id = u.id
        WHERE 1=1
      `
      const queryParams: any[] = []

      if (userId) {
        query += ` AND fe.user_id = $${queryParams.length + 1}`
        queryParams.push(userId)
      }

      if (groupId) {
        query += ` AND fe.group_id = $${queryParams.length + 1}`
        queryParams.push(groupId)
      }

      if (stakeId) {
        query += ` AND fe.stake_id = $${queryParams.length + 1}`
        queryParams.push(stakeId)
      }

      if (mealType) {
        query += ` AND fe.meal_type = $${queryParams.length + 1}`
        queryParams.push(mealType)
      }

      if (date) {
        query += ` AND DATE(fe.created_at) = $${queryParams.length + 1}`
        queryParams.push(date)
      }

      query += ` ORDER BY fe.created_at DESC LIMIT $${queryParams.length + 1}`
      queryParams.push(limit)

      const result = await client.query(query, queryParams)

      // Parse JSON fields
      const entries = result.rows.map(row => ({
        ...row,
        nutrients: row.nutrients ? JSON.parse(row.nutrients) : null,
        ingredients: row.ingredients || [],
        allergens: row.allergens || []
      }))

      return NextResponse.json({
        success: true,
        data: entries
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Food entries fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch food entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
