"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"
import { Trophy, Zap, TrendingUp, Star, Flame, Target, Activity, Award, Camera, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getUserLevel, getXPProgress } from '@/utils/levelingSystem'
import { useUserStats } from '@/hooks/useUserStats'
import { useFoodAnalysis } from '@/hooks/useFoodAnalysis'
import WalletConnect from "@/components/WalletConnect"
import Navigation from '@/components/Navigation'

export default function Home() {
  const router = useRouter()
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [todayCalories, setTodayCalories] = useState(0)
  const [weeklyCalories, setWeeklyCalories] = useState(0)
  
  // Dashboard hooks (only used when authenticated)
  const { userStats, leaderboard, loading } = useUserStats(username)
  const { getFoodEntries } = useFoodAnalysis()

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
        // MiniKit not available, continue with fallback detection
        miniKitInstalled = false
      }
      
      // Simple World App detection
      const userAgent = navigator.userAgent.toLowerCase()
      const isWorldAppUA = userAgent.includes('worldapp') || userAgent.includes('minikit')
      const hasWorldBridge = typeof (window as any).WorldApp !== 'undefined'
      
      setIsWorldApp(miniKitInstalled || isWorldAppUA || hasWorldBridge)
      
      // Check if user is already authenticated
      try {
        const authData = localStorage.getItem('wallet_auth')
        if (authData) {
          const parsed = JSON.parse(authData)
          if (parsed.username) {
            console.log('🔄 User already authenticated, showing dashboard')
            setUsername(parsed.username)
            setIsAuthenticated(true)
            return
          }
        }
      } catch (error) {
        // Invalid auth data, clear it
        localStorage.removeItem('wallet_auth')
      }
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Initialization error:', error)
      setIsWorldApp(false)
      setIsInitialized(true)
    }

    // Dev helper - available globally for testing
    (window as any).clearAuth = () => {
      localStorage.removeItem('wallet_auth')
      window.location.reload()
    }
  }, [router])

  // Load calorie data for dashboard
  const loadCalorieData = async () => {
    if (!username) return
    
    try {
      const entries = await getFoodEntries(username)
      const today = new Date().toDateString()
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const todayEntries = entries.filter(entry => 
        new Date(entry.timestamp).toDateString() === today
      )
      const weeklyEntries = entries.filter(entry => 
        new Date(entry.timestamp) >= oneWeekAgo
      )

      setTodayCalories(todayEntries.reduce((sum, entry) => sum + entry.calories, 0))
      setWeeklyCalories(weeklyEntries.reduce((sum, entry) => sum + entry.calories, 0))
    } catch (error) {
      console.error('Failed to load calorie data:', error)
    }
  }

  // Load calorie data when username changes
  useEffect(() => {
    if (username && isAuthenticated) {
      loadCalorieData()
    }
  }, [username, isAuthenticated])

  const handleConnect = async (address: string, username?: string) => {
    console.log('🔄 handleConnect called with:', { address, username })
    
    const identifier = username || address
    
    if (!identifier) {
      console.error('❌ No identifier provided')
      return
    }
    
    // Set auth for this session only (no persistence)
    const authData = {
      username: identifier,
      verified: true,
      connectedAt: new Date().toISOString()
    }
    
    localStorage.setItem("wallet_auth", JSON.stringify(authData))
    console.log('✅ Auth data stored in localStorage')

    // Sync user with database
    try {
      console.log('🔄 Syncing user with database...')
      const syncResponse = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier }),
      })
      
      if (!syncResponse.ok) {
        const errorData = await syncResponse.json()
        console.error('❌ User sync failed:', errorData)
        // Show user-friendly error but continue
        console.warn('Database sync failed, continuing with local auth only')
      } else {
        const result = await syncResponse.json()
        console.log('✅ User sync completed:', result)
      }
    } catch (error) {
      console.error('⚠️ User sync network error:', error)
      // Continue even if sync fails completely
    }

    console.log('🔄 Setting authentication state...')
    setUsername(identifier)
    setIsAuthenticated(true)
    
    console.log('✅ User authenticated, dashboard will be shown')
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    // Get level information for display
    const levelInfo = userStats ? getUserLevel(userStats.totalXP || 0) : { level: 1, badge: '🌱', title: 'Beginner', color: 'bg-green-100 text-green-800' }
    const xpProgress = userStats ? getXPProgress(userStats.totalXP || 0) : {
      currentLevel: { level: 1, badge: '🌱', title: 'Beginner' },
      nextLevel: { level: 2, badge: '💪', title: 'Active' },
      progressXP: 0,
      neededXP: 500,
      progressPercentage: 0
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🍎</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Welcome back!</h1>
                  <p className="text-sm text-gray-600">@{username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold">
                  {levelInfo.badge} Lv.{levelInfo.level}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Total XP</p>
                    <p className="text-2xl font-bold">{(userStats?.totalXP || 0).toLocaleString()}</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Rank</p>
                    <p className="text-2xl font-bold">#{userStats?.rank || 'N/A'}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Streak</p>
                    <p className="text-2xl font-bold">{userStats?.streak || 1} days</p>
                  </div>
                  <Flame className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Today</p>
                    <p className="text-2xl font-bold">{todayCalories} cal</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {xpProgress.currentLevel.badge} Level {xpProgress.currentLevel.level} → {xpProgress.nextLevel?.badge || '🎯'} Level {xpProgress.nextLevel?.level || (xpProgress.currentLevel.level + 1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {xpProgress.progressXP} / {xpProgress.neededXP} XP
                  </span>
                </div>
                <Progress value={xpProgress.progressPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => router.push('/tracker')}
              className="h-20 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 rounded-2xl"
            >
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-6 w-6" />
                <span className="font-semibold">Log Food</span>
              </div>
            </Button>
            
            <Button
              onClick={() => router.push('/leaderboard')}
              variant="outline"
              className="h-20 border-2 border-orange-200 hover:bg-orange-50 rounded-2xl"
            >
              <div className="flex flex-col items-center gap-2">
                <Trophy className="h-6 w-6 text-orange-600" />
                <span className="font-semibold text-orange-600">Leaderboard</span>
              </div>
            </Button>
          </div>
        </div>

        <Navigation />
      </div>
    )
  }

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
