'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Trophy, Zap, TrendingUp, Users, Star, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getUserLevel, getXPProgress, calculateStreakMultiplier, getAchievements, FOOD_TRACKING_LEVELS } from '@/utils/levelingSystem'

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

interface UserStats {
  totalCalories: number
  totalXP: number
  streak: number
  level: number
  rank: number
}

export default function TrackerPage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalCalories: 0,
    totalXP: 0,
    streak: 1,
    level: 1,
    rank: 1
  })
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by ensuring client-side only rendering for dynamic content
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if user is verified
    const verificationData = localStorage.getItem('worldid_verification')
    if (!verificationData) {
      router.push('/')
      return
    }

    // Load saved data with proper null checks and defaults
    const savedEntries = localStorage.getItem('food_entries')
    const savedStats = localStorage.getItem('user_stats')
    
    if (savedEntries) {
      try {
        const entries = JSON.parse(savedEntries)
        setFoodEntries(Array.isArray(entries) ? entries : [])
      } catch (error) {
        console.error('Error parsing saved entries:', error)
        setFoodEntries([])
      }
    }
    
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats)
        setUserStats({
          totalCalories: Number(stats.totalCalories) || 0,
          totalXP: Number(stats.totalXP) || 0,
          streak: Number(stats.streak) || 1,
          level: Number(stats.level) || 1,
          rank: Number(stats.rank) || 1
        })
      } catch (error) {
        console.error('Error parsing saved stats:', error)
        setUserStats({
          totalCalories: 0,
          totalXP: 0,
          streak: 1,
          level: 1,
          rank: 1
        })
      }
    }
  }, [router])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        analyzeFood(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeFood = async (imageData: string) => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageData,
          userId: (() => {
            try {
              const verification = localStorage.getItem('worldid_verification')
              return verification ? JSON.parse(verification).nullifier_hash : 'anonymous'
            } catch {
              return 'anonymous'
            }
          })()
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Apply streak multiplier to XP
        const streakMultiplier = calculateStreakMultiplier(userStats.streak || 1)
        const finalXP = Math.floor(result.xp * streakMultiplier)
        
        const newEntry: FoodEntry = {
          id: Date.now().toString(),
          image: imageData,
          food: result.food,
          calories: result.calories,
          timestamp: Date.now(),
          xp: finalXP,
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

        const updatedEntries = [newEntry, ...foodEntries]
        const newTotalXP = (userStats.totalXP || 0) + finalXP
        
        // Get new level information
        const levelInfo = getUserLevel(newTotalXP)
        
        const newStats = {
          ...userStats,
          totalCalories: (userStats.totalCalories || 0) + result.calories,
          totalXP: newTotalXP,
          level: levelInfo.level,
          streak: (userStats.streak || 1) + 1
        }

        setFoodEntries(updatedEntries)
        setUserStats(newStats)
        
        // Save to localStorage
        localStorage.setItem('food_entries', JSON.stringify(updatedEntries))
        localStorage.setItem('user_stats', JSON.stringify(newStats))
        
        setSelectedImage(null)
      }
    } catch (error) {
      console.error('Error analyzing food:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const todaysCalories = foodEntries
    .filter(entry => {
      const today = new Date().toDateString()
      const entryDate = new Date(entry.timestamp).toDateString()
      return today === entryDate
    })
    .reduce((sum, entry) => {
      const calories = typeof entry.calories === 'number' ? entry.calories : 0
      return sum + calories
    }, 0)

  // Get level information for display (only after mounting)
  const levelInfo = mounted ? getUserLevel(userStats.totalXP || 0) : FOOD_TRACKING_LEVELS[0]
  const xpProgress = mounted ? getXPProgress(userStats.totalXP || 0) : {
    currentLevel: FOOD_TRACKING_LEVELS[0],
    nextLevel: FOOD_TRACKING_LEVELS[1],
    progressXP: 0,
    neededXP: 500,
    progressPercentage: 0
  }
  const achievements = mounted ? getAchievements(userStats.totalXP || 0, userStats.streak || 1, foodEntries.length) : []

  // Don't render dynamic content until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍎</div>
          <p className="text-orange-600">Loading Fit AI Chain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🍎 Fit AI Chain</h1>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium text-orange-600">
                  {levelInfo.badge} {levelInfo.title}
                </span>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  Level {levelInfo.level}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total XP</div>
                <div className="font-bold text-orange-600">{(userStats.totalXP || 0).toLocaleString()}</div>
              </div>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                🔥 {userStats.streak || 1} day streak
              </Badge>
              {achievements.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Award className="h-3 w-3 mr-1" />
                  {achievements.length} achievements
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Level Progress Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-orange-600" />
                Level Progress
              </span>
              <Badge className="bg-orange-200 text-orange-800">
                {levelInfo.badge} {levelInfo.title}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">{levelInfo.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>XP Progress</span>
                <span>{xpProgress.progressXP.toLocaleString()} / {(levelInfo.maxXP === Infinity ? 'MAX' : levelInfo.maxXP.toLocaleString())}</span>
              </div>
              <Progress value={xpProgress.progressPercentage} className="h-2" />
              {xpProgress.nextLevel && (
                <p className="text-xs text-gray-600">
                  {xpProgress.neededXP.toLocaleString()} XP needed for {xpProgress.nextLevel.badge} {xpProgress.nextLevel.title}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{isNaN(todaysCalories) ? 0 : todaysCalories}</div>
              <p className="text-xs text-gray-500 mt-1">
                {2000 - (isNaN(todaysCalories) ? 0 : todaysCalories) > 0 ? `${2000 - (isNaN(todaysCalories) ? 0 : todaysCalories)} left for goal` : 'Goal exceeded!'}
              </p>
              <Progress value={((isNaN(todaysCalories) ? 0 : todaysCalories) / 2000) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Level {userStats.level || 1}</div>
              <p className="text-xs text-gray-500 mt-1">
                {100 - ((userStats.totalXP || 0) % 100)} XP to next level
              </p>
              <Progress value={((userStats.totalXP || 0) % 100)} className="mt-2" />
            </CardContent>
          </Card>

          <Button 
            onClick={() => router.push('/leaderboard')}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl"
          >
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Leaderboard</div>
              <div className="text-xs opacity-90">Rank #{userStats.rank || 1}</div>
            </div>
          </Button>
        </div>

        {/* Camera Upload */}
        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Camera className="h-5 w-5 mr-2" />
              Snap Your Food
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isAnalyzing}
                />
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 hover:border-orange-400 transition-colors">
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt="Selected food" 
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700">
                        {isAnalyzing ? 'Analyzing your food...' : 'Tap to capture food'}
                      </p>
                      <p className="text-gray-500 mt-2">
                        {isAnalyzing ? 'AI is counting calories 🤖' : 'Get instant calorie count + XP'}
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Recent Meals</CardTitle>
          </CardHeader>
          <CardContent>
            {foodEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🍽️</div>
                <p>No meals tracked yet</p>
                <p className="text-sm">Start by taking a photo of your food!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {foodEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={entry.image} 
                        alt={entry.food}
                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 truncate">{entry.food}</h3>
                          <div className="flex space-x-2">
                            {entry.confidence && (
                              <Badge variant={entry.confidence === 'high' ? 'default' : entry.confidence === 'medium' ? 'secondary' : 'outline'}>
                                {entry.confidence}
                              </Badge>
                            )}
                            {entry.healthScore && (
                              <Badge variant="outline">
                                Health: {entry.healthScore}/10
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          {entry.cuisine && <p><span className="font-medium">Cuisine:</span> {entry.cuisine}</p>}
                          {entry.portionSize && <p><span className="font-medium">Portion:</span> {entry.portionSize}</p>}
                          {entry.cookingMethod && <p><span className="font-medium">Method:</span> {entry.cookingMethod}</p>}
                          <p className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>

                        {entry.ingredients && entry.ingredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Ingredients:</p>
                            <p className="text-xs text-gray-600">{entry.ingredients.join(', ')}</p>
                          </div>
                        )}

                        {entry.nutrients && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Protein:</span>
                                <span className="font-medium">{entry.nutrients.protein}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Carbs:</span>
                                <span className="font-medium">{entry.nutrients.carbs}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Fat:</span>
                                <span className="font-medium">{entry.nutrients.fat}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fiber:</span>
                                <span className="font-medium">{entry.nutrients.fiber}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-lg text-orange-600">{typeof entry.calories === 'number' && !isNaN(entry.calories) ? entry.calories : 0}</div>
                        <div className="text-sm text-gray-500">calories</div>
                        <div className="text-sm font-medium text-yellow-600 mt-1">+{typeof entry.xp === 'number' && !isNaN(entry.xp) ? entry.xp : 0} XP</div>
                      </div>
                    </div>

                    {entry.allergens && entry.allergens.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <p className="text-xs font-medium text-red-600">⚠️ Allergens: {entry.allergens.join(', ')}</p>
                      </div>
                    )}

                    {entry.alternatives && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700">💡 <span className="font-medium">Tip:</span> {entry.alternatives}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Award className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
                    {achievement}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
