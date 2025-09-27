'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Trophy, Zap, TrendingUp, Star, Award, Loader2, Heart, Target, Flame, Home, BarChart3, AlertTriangle, Lightbulb, User } from 'lucide-react'
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍎</span>
          </div>
          <p className="text-orange-600">Loading Fit AI Chain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍎</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fit AI Chain</h1>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
                    {levelInfo.badge} Lv.{levelInfo.level}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{(userStats.totalXP || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-6 space-y-6">
        {/* Today's Progress Card */}
        <Card className="bg-gradient-to-br from-white to-orange-50/50 border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Today's Progress</h2>
                <p className="text-sm text-gray-600">Keep up the great work!</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/70 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {isNaN(todaysCalories) ? 0 : todaysCalories}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Calories</div>
                <div className="text-xs text-gray-400 mt-1">
                  {2000 - (isNaN(todaysCalories) ? 0 : todaysCalories)} left
                </div>
              </div>
              <div className="bg-white/70 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {userStats.streak || 1}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Day Streak</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center justify-center">
                  <Flame className="w-3 h-3 text-orange-500 mr-1" />
                  On fire!
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Daily Goal Progress</span>
                <span className="font-medium text-gray-900">
                  {Math.round(((isNaN(todaysCalories) ? 0 : todaysCalories) / 2000) * 100)}%
                </span>
              </div>
              <Progress 
                value={((isNaN(todaysCalories) ? 0 : todaysCalories) / 2000) * 100} 
                className="h-2 bg-gray-100 rounded-full overflow-hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Camera Upload Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl rounded-3xl overflow-hidden text-white">
          <CardContent className="p-0">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isAnalyzing}
              />
              
              {selectedImage ? (
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Selected food" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Analyzing Food...</h3>
                      <p className="text-white/80">Getting nutritional info with AI</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  {isAnalyzing ? (
                    <div>
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-white" />
                      <h3 className="text-xl font-bold mb-2">Analyzing Food...</h3>
                      <p className="text-white/80">Using AI to identify calories and nutrition</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Snap Your Food</h3>
                      <p className="text-white/90 text-lg mb-6">
                        Take a photo and get instant AI analysis
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-medium">Instant</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-medium">Accurate</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Star className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-medium">Earn XP</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </label>
          </CardContent>
        </Card>

        {/* Recent Food Entries - Enhanced Detailed Cards */}
        {foodEntries.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Meals</h2>
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                {foodEntries.length} tracked
              </Badge>
            </div>
            
            <div className="space-y-4">
              {foodEntries.slice(0, 5).map((entry) => (
                <Card key={entry.id} className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] card-hover">
                  <CardContent className="p-0">
                    {/* Food Image Header */}
                    <div className="relative h-48 sm:h-56">
                      <img 
                        src={entry.image} 
                        alt={entry.food}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      
                      {/* Calorie Badge - Top Right */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {typeof entry.calories === 'number' && !isNaN(entry.calories) ? entry.calories : 0}
                          </div>
                          <div className="text-xs uppercase tracking-wide text-gray-600 font-medium">cal</div>
                        </div>
                      </div>

                      {/* Health Score Badge - Top Left */}
                      {entry.healthScore && (
                        <div className="absolute top-3 left-3 bg-emerald-500/95 backdrop-blur-sm rounded-xl px-3 py-2 text-white shadow-lg">
                          <div className="flex items-center space-x-1">
                            <div className="text-sm font-bold">{entry.healthScore}</div>
                            <div className="text-xs uppercase tracking-wide opacity-90 font-medium">/10</div>
                          </div>
                        </div>
                      )}

                      {/* Confidence Indicator - Bottom Right */}
                      {entry.confidence && (
                        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            entry.confidence === 'high' ? 'bg-emerald-400' : 
                            entry.confidence === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                          }`} />
                          <span className="text-white text-xs font-medium capitalize bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                            {entry.confidence} confidence
                          </span>
                        </div>
                      )}

                      {/* Food Name Overlay - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-xl font-semibold leading-tight mb-2 drop-shadow-lg">
                          {entry.food}
                        </h3>
                        {entry.cuisine && (
                          <p className="text-white/90 text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                            {entry.cuisine} Cuisine
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6 space-y-6">
                      {/* Key Info Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-200 text-sm px-3 py-1 rounded-xl">
                          <Zap className="w-4 h-4 mr-2" />
                          +{typeof entry.xp === 'number' && !isNaN(entry.xp) ? entry.xp : 0} XP
                        </Badge>
                        {entry.portionSize && (
                          <Badge variant="outline" className="text-sm border-orange-300 text-orange-700 px-3 py-1 rounded-xl bg-orange-50">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {entry.portionSize}
                          </Badge>
                        )}
                        {entry.cookingMethod && (
                          <Badge variant="outline" className="text-sm border-red-300 text-red-700 px-3 py-1 rounded-xl bg-red-50">
                            <Flame className="w-3 h-3 mr-1" />
                            {entry.cookingMethod}
                          </Badge>
                        )}
                      </div>

                      {/* Health Tip - First Priority */}
                      {entry.alternatives && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lightbulb className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-emerald-800 mb-2">Health Tip</h4>
                              <p className="text-emerald-700 text-sm leading-relaxed">
                                {entry.alternatives}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Compact Nutrition Breakdown */}
                      {entry.nutrients && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center text-sm">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                            Nutrition Facts
                          </h4>
                          
                          {/* Compact Vertical List Style Nutrition Card */}
                          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
                            <div className="space-y-0 divide-y divide-orange-200/50">
                              <div className="flex justify-between items-center py-2 first:pt-0">
                                <span className="text-xs font-medium text-orange-700">Protein</span>
                                <span className="text-sm font-bold text-orange-600">{entry.nutrients.protein}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-medium text-red-700">Carbs</span>
                                <span className="text-sm font-bold text-red-600">{entry.nutrients.carbs}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-medium text-orange-700">Fat</span>
                                <span className="text-sm font-bold text-orange-600">{entry.nutrients.fat}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-medium text-red-700">Fiber</span>
                                <span className="text-sm font-bold text-red-600">{entry.nutrients.fiber}</span>
                              </div>
                              {entry.nutrients.sugar && (
                                <div className="flex justify-between items-center py-2 last:pb-0">
                                  <span className="text-xs font-medium text-red-700">Sugar</span>
                                  <span className="text-sm font-bold text-red-600">{entry.nutrients.sugar}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Allergen Warning */}
                      {entry.allergens && entry.allergens.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-800 mb-2">Allergen Alert</h4>
                              <p className="text-red-700 text-sm leading-relaxed">
                                <span className="font-medium">Contains:</span> {entry.allergens.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ingredients List */}
                      {entry.ingredients && entry.ingredients.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                            Key Ingredients
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.ingredients.slice(0, 8).map((ingredient, index) => (
                              <span 
                                key={index}
                                className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium border border-emerald-200"
                              >
                                {ingredient}
                              </span>
                            ))}
                            {entry.ingredients.length > 8 && (
                              <span className="bg-orange-50 text-orange-600 px-3 py-2 rounded-xl text-sm border border-orange-200">
                                +{entry.ingredients.length - 8} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timestamp and Additional Info */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {entry.confidence && (
                            <span className="flex items-center">
                              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                entry.confidence === 'high' ? 'bg-emerald-400' : 
                                entry.confidence === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                              }`}></div>
                              AI Analysis
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {foodEntries.length === 0 && (
          <Card className="bg-white/60 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No meals tracked yet</h3>
              <p className="text-gray-600 mb-4">Start your health journey by taking a photo of your food!</p>
              <Button 
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement
                  input?.click()
                }}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl px-6 py-2"
              >
                Take First Photo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Level Progress */}
        {mounted && (
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl rounded-2xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{levelInfo.title}</h3>
                  <p className="text-white/80 text-sm">{levelInfo.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Level {levelInfo.level}</div>
                  <div className="text-white/80 text-sm">{levelInfo.badge}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP Progress</span>
                  <span>{xpProgress.progressXP.toLocaleString()} / {(levelInfo.maxXP === Infinity ? 'MAX' : levelInfo.maxXP.toLocaleString())}</span>
                </div>
                <Progress value={xpProgress.progressPercentage} className="h-2 bg-white/20" />
                {xpProgress.nextLevel && (
                  <p className="text-white/80 text-xs flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    {xpProgress.neededXP.toLocaleString()} XP to reach {xpProgress.nextLevel.title}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-20">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isAnalyzing}
          />
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl flex items-center justify-center hover:shadow-3xl hover:scale-110 transition-all duration-300 active:scale-95">
            {isAnalyzing ? (
              <Loader2 className="h-7 w-7 text-white animate-spin" />
            ) : (
              <Camera className="h-7 w-7 text-white" />
            )}
          </div>
        </label>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-6 py-4 z-30">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-orange-50 rounded-2xl px-4"
            onClick={() => router.push('/')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Home className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600">Home</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 bg-orange-100 text-orange-600 rounded-2xl px-4"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Tracker</span>
          </Button>
          
          <div className="w-12"></div> {/* Spacer for FAB */}
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-orange-50 rounded-2xl px-4"
            onClick={() => router.push('/leaderboard')}
          >
            <Trophy className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-600">Leaderboard</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-orange-50 rounded-2xl px-4"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
