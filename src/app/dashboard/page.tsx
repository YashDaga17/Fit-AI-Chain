'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Zap, TrendingUp, Star, Flame, Target, Activity, Award, Camera, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getUserLevel, getXPProgress } from '@/utils/levelingSystem'
import { useAuth } from '@/hooks/useAuth'
import { useUserStats } from '@/hooks/useUserStats'
import { useFoodAnalysis } from '@/hooks/useFoodAnalysis'
import Navigation from '@/components/Navigation'

interface UserStats {
  totalCalories: number
  totalXP: number
  streak: number
  level: number
  rank: number
  username: string
}

interface LeaderboardEntry {
  username: string
  totalXP: number
  level: number
  rank: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, username, isLoading } = useAuth()
  const { userStats, leaderboard, loading } = useUserStats(username)
  const { getFoodEntries } = useFoodAnalysis()
  const [todayCalories, setTodayCalories] = useState(0)
  const [weeklyCalories, setWeeklyCalories] = useState(0)

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (isLoading) return
    
    if (!isAuthenticated || !username) {
      router.push('/')
      return
    }

    loadCalorieData()
  }, [isAuthenticated, username, isLoading, router])

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  const loadCalorieData = async () => {
    if (!username) return

    try {
      const entries = await getFoodEntries(username)
      
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime()
      
      let todayCals = 0
      let weeklyCals = 0
      
      entries.forEach((entry: any) => {
        const logTime = new Date(entry.timestamp).getTime()
        if (logTime >= todayStart) {
          todayCals += entry.calories || 0
        }
        if (logTime >= weekStart) {
          weeklyCals += entry.calories || 0
        }
      })
      
      setTodayCalories(todayCals)
      setWeeklyCalories(weeklyCals)
    } catch (error) {
      // Handle error silently
    }
  }

  const levelInfo = userStats ? getUserLevel(userStats.totalXP) : { level: 1, title: 'Beginner', badge: '🥉' }
  const progress = userStats ? getXPProgress(userStats.totalXP) : { progressXP: 0, neededXP: 500, progressPercentage: 0 }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
            <p className="text-white/90">@{userStats?.username || 'User'}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Star className="w-8 h-8" />
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Level {levelInfo.level}</span>
            <span className="text-sm">{progress.progressXP} / {progress.neededXP} XP</span>
          </div>
          <Progress value={progress.progressPercentage} className="h-2 bg-white/20" />
          <p className="text-xs text-white/80 mt-2">{levelInfo.title}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Today's Calories */}
          <Card className="bg-gradient-to-br from-orange-100 to-orange-50 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-orange-600" />
                <Badge variant="secondary" className="bg-orange-200 text-orange-800">Today</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">{todayCalories}</p>
              <p className="text-sm text-gray-600">Calories</p>
            </CardContent>
          </Card>

          {/* Total XP */}
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-purple-600" />
                <Badge variant="secondary" className="bg-purple-200 text-purple-800">Total</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">{(userStats?.totalXP || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600">XP Earned</p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="bg-gradient-to-br from-red-100 to-red-50 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-red-600" />
                <Badge variant="secondary" className="bg-red-200 text-red-800">Streak</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">{userStats?.streak || 1}</p>
              <p className="text-sm text-gray-600">Days</p>
            </CardContent>
          </Card>

          {/* Leaderboard Rank */}
          <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Rank</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">#{userStats?.rank || '---'}</p>
              <p className="text-sm text-gray-600">Global</p>
            </CardContent>
          </Card>
        </div>

{/* Weekly Summary */}
<Card className="border-0 shadow-lg">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg flex items-center gap-2">
      <Activity className="w-5 h-5 text-orange-600" />
      Weekly Summary
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="space-y-4">

      {/* Total Calories */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Total Calories</span>

        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">
            {weeklyCalories > 0
              ? weeklyCalories.toLocaleString()
              : "--"}
          </p>

          {weeklyCalories === 0 && (
            <p className="text-xs text-gray-500">
              No meals tracked yet
            </p>
          )}
        </div>
      </div>

      {/* Average Per Day */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Average / Day</span>

        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">
            {weeklyCalories > 0
              ? Math.round(weeklyCalories / 7).toLocaleString()
              : "--"}
          </p>

          {weeklyCalories === 0 && (
            <p className="text-xs text-gray-500">
              Start tracking meals
            </p>
          )}
        </div>
      </div>

      {/* Current Level */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Current Level</span>

        <Badge className="bg-gradient-to-r from-orange-500 to-red-600">
          Lv. {levelInfo.level}
        </Badge>
      </div>

      {/* Empty State Helper */}
      {weeklyCalories === 0 && (
        <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-3">
          <p className="text-sm font-medium text-orange-700">
            Your weekly insights will appear once meal tracking begins.
          </p>

          <p className="text-xs text-orange-600 mt-1">
            Start by scanning or logging your first meal entry.
          </p>
        </div>
      )}

      {/* Progress Hint */}
      <p className="text-xs text-gray-500">
        Consistent tracking helps improve progress visibility and level growth.
      </p>

    </div>
  </CardContent>
</Card>