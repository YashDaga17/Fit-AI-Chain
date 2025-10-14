import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface FoodEntry {
  id: string
  image: string
  food: string
  calories: number
  timestamp: number
  xp: number
  confidence?: string
  cuisine?: string
  portionSize?: string
  ingredients?: string[]
  cookingMethod?: string
  nutrients?: {
    protein: string
    carbs: string
    fat: string
    fiber: string
    sugar?: string
  }
  healthScore?: string
  allergens?: string[]
  alternatives?: string
}

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

export function useFoodAnalysis() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeFood = useCallback(async (imageData: string): Promise<FoodEntry | null> => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // Get username from auth
      const walletAuth = localStorage.getItem('wallet_auth')
      if (!walletAuth) {
        router.push('/')
        return null
      }

      const authData = JSON.parse(walletAuth)
      const username = authData.username

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
        throw new Error('Failed to analyze food')
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

        // Step 2: Save to database
        try {
          const dbResponse = await fetch('/api/food-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              foodLog: newEntry
            })
          })

          if (!dbResponse.ok) {
            const error = await dbResponse.json()
            throw new Error(error.message || 'Failed to save to database')
          }
        } catch (dbError: any) {
          setError('Analysis successful but failed to save to database: ' + dbError.message)
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
      const response = await fetch(`/api/food-logs?username=${username}`)
      if (!response.ok) {
        throw new Error('Failed to fetch food entries')
      }
      
      const data = await response.json()
      return data.logs || []
    } catch (error: any) {
      setError(error.message || 'Failed to fetch food entries')
      return []
    }
  }, [])

  return {
    isAnalyzing,
    error,
    analyzeFood,
    getFoodEntries,
    clearError: () => setError(null)
  }
}
