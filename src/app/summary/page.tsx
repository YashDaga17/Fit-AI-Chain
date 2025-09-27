'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Target, 
  BarChart3,
  Zap,
  Award,
  CheckCircle
} from 'lucide-react'

interface FoodLog {
  id: string
  timestamp: string
  analysis: {
    total_calories: number
    foods: Array<{
      protein: number
      carbohydrates: number
      fat: number
    }>
  }
}

export default function SummaryPage() {
  const router = useRouter()
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verificationData = localStorage.getItem('worldid_verification')
    if (!verificationData) {
      router.push('/')
      return
    }
    setIsVerified(true)

    const savedLogs = localStorage.getItem('food_logs')
    if (savedLogs) {
      setFoodLogs(JSON.parse(savedLogs))
    }
  }, [router])

  if (!isVerified) {
    return null
  }

  // Calculate weekly stats
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  weekStart.setHours(0, 0, 0, 0)

  const weeklyLogs = foodLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    return logDate >= weekStart
  })

  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    
    const dayLogs = weeklyLogs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate.toDateString() === date.toDateString()
    })

    const calories = dayLogs.reduce((sum, log) => sum + log.analysis.total_calories, 0)
    const protein = dayLogs.reduce((sum, log) => sum + log.analysis.foods.reduce((p, f) => p + f.protein, 0), 0)
    const carbs = dayLogs.reduce((sum, log) => sum + log.analysis.foods.reduce((c, f) => c + f.carbohydrates, 0), 0)
    const fat = dayLogs.reduce((sum, log) => sum + log.analysis.foods.reduce((f, food) => f + food.fat, 0), 0)

    return {
      date,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      entries: dayLogs.length
    }
  })

  const weeklyTotals = {
    calories: dailyStats.reduce((sum, day) => sum + day.calories, 0),
    protein: dailyStats.reduce((sum, day) => sum + day.protein, 0),
    carbs: dailyStats.reduce((sum, day) => sum + day.carbs, 0),
    fat: dailyStats.reduce((sum, day) => sum + day.fat, 0),
    entries: dailyStats.reduce((sum, day) => sum + day.entries, 0)
  }

  const weeklyAverages = {
    calories: Math.round(weeklyTotals.calories / 7),
    protein: Math.round(weeklyTotals.protein / 7),
    carbs: Math.round(weeklyTotals.carbs / 7),
    fat: Math.round(weeklyTotals.fat / 7)
  }

  const daysWithEntries = dailyStats.filter(day => day.entries > 0).length
  const consistency = Math.round((daysWithEntries / 7) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/calories')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Weekly Summary
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Weekly Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Zap className="h-5 w-5" />
                <span>Avg Calories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{weeklyAverages.calories}</div>
              <div className="text-blue-100 text-sm">per day</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                <span>Avg Protein</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{weeklyAverages.protein}g</div>
              <div className="text-green-100 text-sm">per day</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Award className="h-5 w-5" />
                <span>Consistency</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{consistency}%</div>
              <div className="text-purple-100 text-sm">{daysWithEntries}/7 days</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Target className="h-5 w-5" />
                <span>Total Entries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{weeklyTotals.entries}</div>
              <div className="text-orange-100 text-sm">this week</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Daily Breakdown</span>
            </CardTitle>
            <CardDescription>
              Your nutrition intake for each day this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyStats.map((day, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">
                        {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h3>
                      {day.entries > 0 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {day.entries} {day.entries === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                  
                  {day.entries > 0 ? (
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Calories</div>
                        <div className="font-semibold text-blue-600">{day.calories}</div>
                        <Progress value={Math.min((day.calories / 2000) * 100, 100)} className="mt-1 h-1" />
                      </div>
                      <div>
                        <div className="text-gray-500">Protein</div>
                        <div className="font-semibold text-green-600">{day.protein}g</div>
                        <Progress value={Math.min((day.protein / 150) * 100, 100)} className="mt-1 h-1" />
                      </div>
                      <div>
                        <div className="text-gray-500">Carbs</div>
                        <div className="font-semibold text-orange-600">{day.carbs}g</div>
                        <Progress value={Math.min((day.carbs / 200) * 100, 100)} className="mt-1 h-1" />
                      </div>
                      <div>
                        <div className="text-gray-500">Fat</div>
                        <div className="font-semibold text-purple-600">{day.fat}g</div>
                        <Progress value={Math.min((day.fat / 65) * 100, 100)} className="mt-1 h-1" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      No food entries for this day
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Totals</CardTitle>
            <CardDescription>
              Summary of your entire week's nutrition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{weeklyTotals.calories.toLocaleString()}</div>
                <div className="text-gray-600">Total Calories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">{weeklyTotals.protein}g</div>
                <div className="text-gray-600">Total Protein</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">{weeklyTotals.carbs}g</div>
                <div className="text-gray-600">Total Carbs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">{weeklyTotals.fat}g</div>
                <div className="text-gray-600">Total Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {weeklyLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
              <CardDescription>
                Personalized tips based on your tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consistency >= 80 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                      🎉 Great consistency! You tracked food {daysWithEntries} out of 7 days this week.
                    </p>
                  </div>
                )}
                
                {weeklyAverages.protein >= 100 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                      💪 Excellent protein intake! You averaged {weeklyAverages.protein}g per day.
                    </p>
                  </div>
                )}
                
                {consistency < 50 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      📈 Try to track your food more consistently for better insights and progress.
                    </p>
                  </div>
                )}
                
                {weeklyAverages.calories < 1200 && weeklyTotals.entries > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800">
                      ⚠️ Your average daily calories seem low. Consider consulting with a nutritionist.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
