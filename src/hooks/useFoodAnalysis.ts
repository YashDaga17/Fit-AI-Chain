import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeUsername } from '@/lib/validation'
import type { FoodEntry } from '@/types/tracker'

interface AnalysisResult {
  success: boolean
  food: string
  calories: number
  description: string
  confidence: string
  cuisine: string
  portionSize: string
  ingredients: string[]
  cookingMethod: string
  nutrients: {
    protein: string
    carbs: string
    fat: string
    fiber: string
    sugar?: string
  }
  healthScore: string
  allergens: string[]
  alternatives: string
  xp: number
  baseXP: number
  bonusMultiplier: number
}

type FoodLogPayload = Partial<FoodEntry> & {
  food: string
  calories: number
}

export function useFoodAnalysis() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getErrorMessage = async (response: Response, fallback: string) => {
    const data = await response.json().catch(() => null)
    return data?.error || data?.message || fallback
  }

  const getUsernameFromStorage = () => {
    const walletAuth = localStorage.getItem('wallet_auth')
    if (!walletAuth) {
      return null
    }

    try {
      const authData = JSON.parse(walletAuth)
      return normalizeUsername(authData.username)
    } catch {
      return null
    }
  }

  const mapLogToFoodEntry = (log: any): FoodEntry => ({
    id: log.id?.toString() || Date.now().toString(),
    image: log.imageUrl || '/placeholder-food.jpg',
    food: log.foodName || log.food,
    calories: log.calories || 0,
    timestamp: new Date(log.createdAt || Date.now()).getTime(),
    xp: log.xpEarned || log.xp || 0,
    confidence: log.confidence,
    cuisine: log.cuisine,
    portionSize: log.portionSize,
    ingredients: log.ingredients,
    cookingMethod: log.cookingMethod,
    nutrients: log.nutrients,
    healthScore: log.healthScore,
    allergens: log.allergens,
    alternatives: log.alternatives,
    mealType: log.mealType,
  })

  const saveFoodLog = useCallback(async (username: string, foodLog: FoodLogPayload, method: 'POST' | 'PUT', id?: string) => {
    const response = await fetch('/api/food-logs', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(id ? { id } : {}),
        username,
        foodLog,
      }),
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, method === 'POST' ? 'Failed to save to database' : 'Failed to update food log'))
    }

    const data = await response.json().catch(() => null)
    return data?.log ? mapLogToFoodEntry(data.log) : null
  }, [])

  const analyzeFood = useCallback(async (imageData: string): Promise<FoodEntry | null> => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // Get username from auth
      const username = getUsernameFromStorage()
      if (!username) {
        router.push('/')
        return null
      }

      // Step 1: Analyze food with AI
      const analyzeResponse = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData,
          userId: username
        }),
      })

      if (!analyzeResponse.ok) {
        throw new Error(await getErrorMessage(analyzeResponse, 'Failed to analyze food'))
      }

      const result: AnalysisResult = await analyzeResponse.json()

      if (result.success) {
        const newEntry: FoodEntry = {
          id: Date.now().toString(),
          image: imageData,
          food: result.food,
          calories: result.calories,
          timestamp: Date.now(),
          xp: result.xp,
          confidence: result.confidence,
          cuisine: result.cuisine,
          portionSize: result.portionSize,
          ingredients: result.ingredients,
          cookingMethod: result.cookingMethod,
          nutrients: result.nutrients,
          healthScore: result.healthScore,
          allergens: result.allergens,
          alternatives: result.alternatives
        }

        // Step 2: Save to database (with the full image data)
        try {
          const savedEntry = await saveFoodLog(username, newEntry, 'POST')
          if (savedEntry) {
            return savedEntry
          }
        } catch (dbError: any) {
          setError('Analysis successful! Food logged locally, but couldn\'t sync to cloud database.')
          return newEntry // Still return the entry even if DB save fails
        }

        return newEntry
      } else {
        throw new Error('Food analysis failed')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to analyze food')
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [router])

  const getFoodEntries = useCallback(async (username: string): Promise<FoodEntry[]> => {
    try {
      const normalizedUsername = normalizeUsername(username)
      if (!normalizedUsername) {
        return []
      }

      const response = await fetch(`/api/food-logs?username=${encodeURIComponent(normalizedUsername)}`)
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to fetch food entries'))
      }
      
      const data = await response.json()
      const logs = data.logs || []
      
      return logs.map(mapLogToFoodEntry)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch food entries')
      return []
    }
  }, [])

  const createManualEntry = useCallback(async (foodLog: FoodLogPayload): Promise<FoodEntry | null> => {
    const username = getUsernameFromStorage()
    if (!username) {
      router.push('/')
      return null
    }

    setError(null)

    try {
      const savedEntry = await saveFoodLog(username, {
        image: foodLog.image || '/placeholder-food.jpg',
        xp: foodLog.xp || Math.max(10, Math.round(foodLog.calories / 4)),
        ...foodLog,
      }, 'POST')
      return savedEntry
    } catch (error: any) {
      setError(error.message || 'Failed to save food log')
      return null
    }
  }, [router, saveFoodLog])

  const updateFoodEntry = useCallback(async (id: string, foodLog: FoodLogPayload): Promise<FoodEntry | null> => {
    const username = getUsernameFromStorage()
    if (!username) {
      router.push('/')
      return null
    }

    setError(null)

    try {
      return await saveFoodLog(username, foodLog, 'PUT', id)
    } catch (error: any) {
      setError(error.message || 'Failed to update food log')
      return null
    }
  }, [router, saveFoodLog])

  const deleteFoodEntry = useCallback(async (id: string): Promise<boolean> => {
    const username = getUsernameFromStorage()
    if (!username) {
      router.push('/')
      return false
    }

    setError(null)

    try {
      const response = await fetch(`/api/food-logs?id=${encodeURIComponent(id)}&username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to delete food log'))
      }

      return true
    } catch (error: any) {
      setError(error.message || 'Failed to delete food log')
      return false
    }
  }, [router])

  return {
    isAnalyzing,
    error,
    analyzeFood,
    getFoodEntries,
    createManualEntry,
    updateFoodEntry,
    deleteFoodEntry,
    clearError: () => setError(null)
  }
}
