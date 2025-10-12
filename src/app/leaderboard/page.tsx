'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Medal, Award, Loader2, House, TrendingUp, Activity, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useUserStats } from '@/hooks/useUserStats'

interface LeaderboardEntry {
  rank: number
  username: string
  totalXP: number
  level: number
  totalCalories: number
  totalEntries: number  // Now required since API provides this
  joinedAt: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { isAuthenticated, username } = useAuth()
  const { leaderboard, loading, error } = useUserStats(username)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'alltime'>('alltime')

  useEffect(() => {
    if (!isAuthenticated || !username) {
      router.push('/')
      return
    }
  }, [isAuthenticated, username, router])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">#{rank}</div>
  }

  const getRankStyle = (username: string, rank: number) => {
    const isUser = username && username === username
    if (isUser) return 'bg-orange-100 border-orange-300 shadow-lg ring-2 ring-orange-400'
    if (rank === 1) return 'bg-yellow-50 border-yellow-300'
    if (rank === 2) return 'bg-gray-50 border-gray-300'
    if (rank === 3) return 'bg-amber-50 border-amber-300'
    return 'bg-white border-gray-200'
  }

  const isCurrentUser = (entryUsername: string) => {
    return username && entryUsername === username
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-orange-50 rounded-2xl p-2"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-sm text-gray-600">See how you rank globally</p>
              </div>
            </div>
            {username && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1 rounded-xl">
                @{username}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-6 space-y-6">
        {/* Timeframe Selector */}
        <Card className="bg-white/70 backdrop-blur border-0 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setTimeframe('daily')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    timeframe === 'daily'
                      ? 'bg-white shadow-sm text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    timeframe === 'weekly'
                      ? 'bg-white shadow-sm text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeframe('alltime')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    timeframe === 'alltime'
                      ? 'bg-white shadow-sm text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        <Card className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 border-0 shadow-xl rounded-3xl text-white overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-center mb-6 flex items-center justify-center">
              <Trophy className="w-5 h-5 mr-2" />
              Top Champions
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <div key={entry.rank} className="text-center">
                  <div className={`relative mx-auto mb-3 ${
                    index === 0 ? 'w-16 h-16' : 'w-12 h-12'
                  } bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center`}>
                    {index === 0 ? (
                      <Trophy className="w-8 h-8 text-yellow-300" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-gray-300" />
                    ) : (
                      <Award className="w-6 h-6 text-amber-300" />
                    )}
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-yellow-900" />
                      </div>
                    )}
                  </div>
                  <div className={`font-bold ${index === 0 ? 'text-lg' : 'text-sm'} truncate`}>
                    {isCurrentUser(entry.username) ? (
                      <div className="flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        You
                      </div>
                    ) : entry.username}
                  </div>
                  <div className="text-white/80 text-xs">{(entry.totalXP || 0).toLocaleString()} XP</div>
                  <div className="text-white/60 text-xs">Lv.{entry.level || 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 px-1">All Rankings</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : leaderboard.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No leaderboard data available yet.</p>
                <p className="text-sm text-gray-500 mt-2">Start tracking food to see rankings!</p>
              </CardContent>
            </Card>
          ) : (
            leaderboard.map((entry) => (
              <Card 
                key={entry.rank} 
                className={`border-0 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  getRankStyle(entry.username, entry.rank)
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isCurrentUser(entry.username)
                        ? 'bg-white/20 backdrop-blur-sm text-white' 
                        : entry.rank <= 3
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.rank <= 3 ? (
                        getRankIcon(entry.rank)
                      ) : (
                        <span className="font-bold text-sm">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        isCurrentUser(entry.username) ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'
                      }`}>
                        {isCurrentUser(entry.username) ? '🎯' : '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate ${
                          isCurrentUser(entry.username) ? 'text-white' : 'text-gray-900'
                        }`}>
                          {isCurrentUser(entry.username) ? '🎯 You' : entry.username}
                        </div>
                        <div className={`text-sm flex items-center space-x-2 ${
                          isCurrentUser(entry.username) ? 'text-white/80' : 'text-gray-600'
                        }`}>
                          <span>Level {entry.level || 1}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {entry.totalEntries || 0} entries
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className={`font-bold ${isCurrentUser(entry.username) ? 'text-white' : 'text-gray-900'}`}>
                        {(entry.totalXP || 0).toLocaleString()}
                      </div>
                      <div className={`text-xs uppercase tracking-wide ${
                        isCurrentUser(entry.username) ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        XP Points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Your Stats Card */}
        {username && leaderboard.find(e => isCurrentUser(e.username)) && (
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl rounded-2xl text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">#{leaderboard.find(e => isCurrentUser(e.username))?.rank || '---'}</div>
                    <div className="text-white/80 text-sm">Global Rank</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">
                      {leaderboard.find(e => isCurrentUser(e.username))?.level || 1}
                    </div>
                    <div className="text-white/80 text-sm">Current Level</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">
                      {leaderboard.find(e => isCurrentUser(e.username))?.totalXP || 0}
                    </div>
                    <div className="text-white/80 text-sm">Total XP</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-6 py-4 z-30">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-orange-50 rounded-2xl px-4"
            onClick={() => router.push('/dashboard')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <House className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600">Home</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-orange-50 rounded-2xl px-4"
            onClick={() => router.push('/tracker')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600">Tracker</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 bg-orange-100 text-orange-600 rounded-2xl px-4"
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs font-medium">Leaderboard</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
