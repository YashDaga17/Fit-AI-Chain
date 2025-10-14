"use client"

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
import WalletConnect from "@/components/WalletConnect"
import { MiniKit } from "@worldcoin/minikit-js"

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

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, username, isLoading } = useAuth()
  const { userStats, leaderboard, loading } = useUserStats(username)
  const { getFoodEntries } = useFoodAnalysis()
  const [todayCalories, setTodayCalories] = useState(0)
  const [weeklyCalories, setWeeklyCalories] = useState(0)
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const appId = process.env.NEXT_PUBLIC_WLD_APP_ID
      
      if (!appId) {
        setIsWorldApp(false)
        setIsInitialized(true)
        return
      }
      
      // Install MiniKit synchronously with error handling
      let miniKitInstalled = false
      try {
          if (typeof window !== "undefined" && !MiniKit.isInstalled()) {
            MiniKit.install(appId)
          }
          miniKitInstalled = MiniKit.isInstalled()
        } catch (error) {
        miniKitInstalled = false
      }
      
      // Enhanced World App detection
      const userAgent = navigator.userAgent.toLowerCase()
      const isWorldAppUA = userAgent.includes('worldapp') || userAgent.includes('minikit')
      const hasWorldBridge = typeof (window as any).WorldApp !== 'undefined'
      const hasWebViewBridge = typeof (window as any).webkit?.messageHandlers?.minikit !== 'undefined'
      
      
      const isInWorldApp = miniKitInstalled || isWorldAppUA || hasWorldBridge || hasWebViewBridge
      setIsWorldApp(isInWorldApp)
      setIsInitialized(true)
      
    } catch (error) {
      setIsWorldApp(false)
      setIsInitialized(true)
    }

    // Dev helper - available globally for testing
    (window as any).clearAuth = () => {
      localStorage.removeItem('wallet_auth')
      window.location.reload()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && username) {
      loadCalorieData()
    }
  }, [isAuthenticated, username])

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

  const handleConnect = async (address: string, username?: string) => {
    
    const identifier = username || address
    
    if (!identifier) {
      return
    }
    
    // Sync user with database FIRST before setting auth
    try {
      const syncResponse = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier }),
      })
      
      if (!syncResponse.ok) {
        const errorData = await syncResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to sync user data')
      }
      
      const result = await syncResponse.json()
      
      // Only set auth AFTER successful sync
      const authData = {
        username: identifier,
        verified: true,
        connectedAt: new Date().toISOString()
      }
      
      localStorage.setItem("wallet_auth", JSON.stringify(authData))
      
      // Small delay to ensure state updates properly
      setTimeout(() => {
        window.location.reload()
      }, 100)
      
    } catch (error: any) {
      
      // Show error to user but still allow them to proceed in dev mode
      if (confirm(`Database sync failed: ${error.message}\n\nContinue in offline mode? (Development only)`)) {
        const authData = {
          username: identifier,
          verified: true,
          connectedAt: new Date().toISOString(),
          offlineMode: true
        }
        
        localStorage.setItem("wallet_auth", JSON.stringify(authData))
        window.location.reload()
      }
    }
  }

  // Show loading while authentication is being checked
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        {!isWorldApp && (
          <div className="absolute top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-sm z-10">
            <p className="font-semibold">⚠️ Development Mode</p>
            <p>Open in World App for full features</p>
            <p className="text-xs mt-1">Check console for database status</p>
          </div>
        )}
        {isWorldApp && (
          <div className="absolute top-4 left-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg text-sm z-10">
            <p className="font-semibold">✅ World App Detected</p>
            <p>Full features enabled!</p>
          </div>
        )}
        <WalletConnect onConnect={handleConnect} />
      </div>
    )
  }

  // Dashboard content for authenticated users
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Calories</span>
                <span className="font-bold text-lg">{weeklyCalories.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average/Day</span>
                <span className="font-bold text-lg">{Math.round(weeklyCalories / 7).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Level</span>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-600">
                  Lv. {levelInfo.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Users */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 3).map((user, index) => (
                <div key={user.username} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-amber-600'
                  }`}>
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-600">Lv. {user.level} • {user.totalXP.toLocaleString()} XP</p>
                  </div>
                  {index === 0 && <Trophy className="w-5 h-5 text-yellow-600" />}
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/leaderboard')}
            >
              View Full Leaderboard
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-20 bg-gradient-to-r from-orange-500 to-red-600 text-white"
            onClick={() => router.push('/tracker')}
          >
            <div className="flex flex-col items-center gap-1">
              <Camera className="w-6 h-6" />
              <span className="text-sm">Scan Food</span>
            </div>
          </Button>
          <Button 
            className="h-20 bg-gradient-to-r from-purple-500 to-pink-600 text-white"
            onClick={() => router.push('/leaderboard')}
          >
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-6 h-6" />
              <span className="text-sm">Leaderboard</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  )
}
