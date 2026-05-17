import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recipes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { upsertUser } from '@/lib/db-utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ success: false, message: 'Missing username' }, { status: 400 })
    }

    const user = await upsertUser(username)

    if (!db) {
      return NextResponse.json({ success: true, recipes: [] })
    }

    const userRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, user.id))
      .orderBy(recipes.createdAt) // Note: this defaults to ascending.

    return NextResponse.json({ success: true, recipes: userRecipes })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve recipes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { username, name, description, servings, ingredients, totalCalories, totalProtein, totalCarbs, totalFat, imageUrl, isPublic } = data

    if (!username || !name || !ingredients || totalCalories === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const user = await upsertUser(username)

    if (!db) {
      // Mock return for development without DB
      return NextResponse.json({
        success: true,
        recipe: {
          id: Date.now(),
          userId: user.id,
          name,
          description,
          servings: servings || 1,
          ingredients,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          imageUrl,
          isPublic: isPublic || false,
          createdAt: new Date()
        }
      })
    }

    const [newRecipe] = await db.insert(recipes).values({
      userId: user.id,
      name,
      description,
      servings: servings || 1,
      ingredients,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      imageUrl,
      isPublic: isPublic || false,
    }).returning()

    return NextResponse.json({ success: true, recipe: newRecipe })
  } catch (error) {
    console.error('Error saving recipe:', error)
    return NextResponse.json({ success: false, message: 'Failed to save recipe' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json()
    const { id, username, name, description, servings, ingredients, totalCalories, totalProtein, totalCarbs, totalFat, isPublic } = data

    if (!id || !username || !name || !ingredients || totalCalories === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const user = await upsertUser(username)

    if (!db) {
      return NextResponse.json({ success: true, recipe: { id, name, description, servings, ingredients, totalCalories, totalProtein, totalCarbs, totalFat, isPublic } })
    }

    const [updated] = await db
      .update(recipes)
      .set({ name, description, servings, ingredients, totalCalories, totalProtein, totalCarbs, totalFat, isPublic })
      .where(eq(recipes.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, recipe: updated })
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json({ success: false, message: 'Failed to update recipe' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')
    const username = searchParams.get('username')

    if (!idParam || !username) {
      return NextResponse.json({ success: false, message: 'Missing id or username' }, { status: 400 })
    }
    
    const id = parseInt(idParam, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 })
    }

    const user = await upsertUser(username)
    
    if (!db) {
      return NextResponse.json({ success: true })
    }

    const deleted = await db
      .delete(recipes)
      .where(eq(recipes.id, id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete recipe' }, { status: 500 })
  }
}
