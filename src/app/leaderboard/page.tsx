'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Medal, Award, Zap, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
  rank: number
  name: string
  totalXP: number
  level: number
  streak: number
  totalCalories: number
  avatar: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState(1)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'alltime'>('weekly')

  useEffect(() => {
    const verificationData = localStorage.getItem('worldid_verification')
    if (!verificationData) {
      router.push('/')
      return
    }

    generateMockLeaderboard()
  }, [router, timeframe])

  const generateMockLeaderboard = () => {
    const userStats = JSON.parse(localStorage.getItem('user_stats') || '{"totalXP": 0, "level": 1, "streak": 1, "totalCalories": 0}')
    
    const mockData: LeaderboardEntry[] = [
      { rank: 1, name: 'FoodMaster99', totalXP: 2840, level: 28, streak: 45, totalCalories: 28400, avatar: '🍕' },
      { rank: 2, name: 'HealthyEater', totalXP: 2650, level: 26, streak: 38, totalCalories: 26500, avatar: '🥗' },
      { rank: 3, name: 'CalorieKing', totalXP: 2380, level: 23, streak: 32, totalCalories: 23800, avatar: '👑' },
      { rank: 4, name: 'FitnessFan', totalXP: 2120, level: 21, streak: 28, totalCalories: 21200, avatar: '💪' },
      { rank: 5, name: 'NutritionNinja', totalXP: 1980, level: 19, streak: 24, totalCalories: 19800, avatar: '🥷' },
      { rank: 6, name: 'You', totalXP: userStats.totalXP, level: userStats.level, streak: userStats.streak, totalCalories: userStats.totalCalories, avatar: '🎯' },
      { rank: 7, name: 'WellnessWarrior', totalXP: 1650, level: 16, streak: 18, totalCalories: 16500, avatar: '⚔️' },
      { rank: 8, name: 'SnapAndTrack', totalXP: 1420, level: 14, streak: 15, totalCalories: 14200, avatar: '📸' },
      { rank: 9, name: 'BalancedLife', totalXP: 1180, level: 11, streak: 12, totalCalories: 11800, avatar: '⚖️' },
      { rank: 10, name: 'HealthHunter', totalXP: 980, level: 9, streak: 8, totalCalories: 9800, avatar: '🎯' },
    ]

    const sorted = mockData.sort((a, b) => b.totalXP - a.totalXP)
    sorted.forEach((entry, index) => {
      entry.rank = index + 1
      if (entry.name === 'You') {
        setUserRank(entry.rank)
      }
    })

    setLeaderboard(sorted)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">#{rank}</div>
  }

  const getRankStyle = (rank: number, isUser: boolean = false) => {
    if (isUser) return 'bg-orange-100 border-orange-300 shadow-lg'
    if (rank === 1) return 'bg-yellow-50 border-yellow-300'
    if (rank === 2) return 'bg-gray-50 border-gray-300'
    if (rank === 3) return 'bg-amber-50 border-amber-300'
    return 'bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-orange-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h1>
                <p className="text-gray-600">See how you stack up!</p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Your Rank: #{userRank}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Timeframe Selector */}
        <div className="flex justify-center space-x-2">
          {(['daily', 'weekly', 'alltime'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
              className={timeframe === period ? 
                'bg-orange-500 hover:bg-orange-600' : 
                'border-orange-200 hover:bg-orange-50'
              }
            >
              {period === 'daily' && <Calendar className="h-4 w-4 mr-1" />}
              {period === 'weekly' && <Zap className="h-4 w-4 mr-1" />}
              {period === 'alltime' && <Trophy className="h-4 w-4 mr-1" />}
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <Card 
              key={entry.rank}
              className={`text-center ${getRankStyle(entry.rank, entry.name === 'You')} shadow-lg`}
            >
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">{entry.avatar}</div>
                <div className="flex justify-center mb-2">
                  {getRankIcon(entry.rank)}
                </div>
                <h3 className="font-bold text-gray-800 truncate">{entry.name}</h3>
                <p className="text-2xl font-bold text-orange-600">{entry.totalXP}</p>
                <p className="text-xs text-gray-600">XP • Level {entry.level}</p>
                <Badge variant="outline" className="mt-2 border-orange-200 text-orange-700">
                  {entry.streak} day streak
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div 
                  key={`${entry.rank}-${entry.name}`}
                  className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                    getRankStyle(entry.rank, entry.name === 'You')
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getRankIcon(entry.rank)}
                    <div className="text-2xl">{entry.avatar}</div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold ${entry.name === 'You' ? 'text-orange-800' : 'text-gray-800'}`}>
                      {entry.name}
                      {entry.name === 'You' && <span className="ml-2 text-orange-600">(You)</span>}
                    </h3>
                    <p className="text-sm text-gray-600">Level {entry.level}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{entry.totalXP.toLocaleString()} XP</div>
                    <div className="text-sm text-gray-600">{entry.streak} day streak</div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div>{Math.floor(entry.totalCalories / 1000)}k cal tracked</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-bold text-orange-800 mb-2">Keep Climbing!</h3>
            <p className="text-orange-700">
              Track more meals to earn XP and climb the leaderboard. Every photo counts!
            </p>
            <Button 
              onClick={() => router.push('/tracker')}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Track More Food 📸
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
