'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trophy, Clock, Users, Target, Coins, Medal, Camera, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Stake, GroupLeaderboardEntry, MealTrackingStatus, EnhancedFoodEntry } from '@/types/teams'

export default function StakeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const stakeId = params.id as string

  const [stake, setStake] = useState<Stake | null>(null)
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardEntry[]>([])
  const [mealStatus, setMealStatus] = useState<MealTrackingStatus[]>([])
  const [stakeEntries, setStakeEntries] = useState<EnhancedFoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (stakeId) {
      loadStakeData()
      // Get current user
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      setCurrentUser(userData)
    }
  }, [stakeId])

  useEffect(() => {
    if (stake) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const endTime = new Date(stake.end_time).getTime()
        const remaining = Math.max(0, endTime - now)
        setTimeRemaining(remaining)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [stake])

  const loadStakeData = async () => {
    try {
      // Load stake details
      const stakeResponse = await fetch(`/api/stakes?stakeId=${stakeId}`)
      if (stakeResponse.ok) {
        const stakeResult = await stakeResponse.json()
        setStake(stakeResult.data)
      }

      // Load stake leaderboard
      const leaderboardResponse = await fetch(`/api/leaderboards?stakeId=${stakeId}`)
      if (leaderboardResponse.ok) {
        const leaderboardResult = await leaderboardResponse.json()
        setLeaderboard(leaderboardResult.data || [])
      }

      // Load meal tracking status if it's a meal competition
      const mealResponse = await fetch(`/api/meal-windows?status=true&userId=${getCurrentUserId()}&stakeId=${stakeId}`)
      if (mealResponse.ok) {
        const mealResult = await mealResponse.json()
        setMealStatus(mealResult.data?.status || [])
      }

      // Load stake entries
      const entriesResponse = await fetch(`/api/food-entries?stakeId=${stakeId}&limit=50`)
      if (entriesResponse.ok) {
        const entriesResult = await entriesResponse.json()
        setStakeEntries(entriesResult.data || [])
      }

    } catch (error) {
      console.error('Error loading stake data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUserId = () => {
    // This would be replaced with actual user ID logic
    return 1
  }

  const joinStake = async () => {
    if (!stake || !currentUser) return

    try {
      const response = await fetch('/api/stakes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stake_id: stake.id,
          user_id: getCurrentUserId(),
          amount: stake.stake_amount
        })
      })

      if (response.ok) {
        await loadStakeData()
      }
    } catch (error) {
      console.error('Error joining stake:', error)
    }
  }

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-gray-600">#{rank}</span>
  }

  const getCurrentMealWindow = () => {
    if (!stake || stake.competition_type !== 'meal') return null
    return mealStatus.find(status => status.meal_type === stake.meal_type)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stake...</p>
        </div>
      </div>
    )
  }

  if (!stake) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Stake Not Found</h2>
          <p className="text-gray-600 mb-4">The stake you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/teams')}>Back to Teams</Button>
        </Card>
      </div>
    )
  }

  const currentMealWindow = getCurrentMealWindow()
  const isUserParticipating = stake.participants?.some(p => p.user_id === getCurrentUserId())

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/teams')}
                className="hover:bg-orange-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {stake.competition_type === 'daily' ? 'Daily Challenge' : `${stake.meal_type} Challenge`}
                  </h1>
                  <p className="text-sm text-gray-600">{stake.group_name}</p>
                </div>
              </div>
            </div>

            {!isUserParticipating && stake.status === 'active' && timeRemaining > 0 && (
              <Button 
                size="sm" 
                onClick={joinStake}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Target className="h-4 w-4 mr-1" />
                Join Stake ({stake.stake_amount} WLD)
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stake Info */}
          <div className="space-y-6">
            {/* Stake Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span>Stake Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stake.total_pool} WLD</p>
                    <p className="text-sm text-gray-500">Total Prize Pool</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{stake.competition_type === 'daily' ? 'Daily Challenge' : 'Meal Challenge'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Participants:</span>
                      <span>{stake.participants?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={stake.status === 'active' ? 'default' : 'secondary'}>
                        {stake.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created by:</span>
                      <span>{stake.creator_username}</span>
                    </div>
                  </div>

                  {stake.status === 'active' && (
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatTimeRemaining(timeRemaining)}
                      </p>
                    </div>
                  )}

                  {stake.status === 'completed' && stake.winner_username && (
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Winner</p>
                      <p className="font-bold text-yellow-600">{stake.winner_username}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Meal Window Status (for meal competitions) */}
            {stake.competition_type === 'meal' && currentMealWindow && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Meal Window</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{currentMealWindow.meal_type}</span>
                      <Badge variant={currentMealWindow.is_active ? 'default' : 'secondary'}>
                        {currentMealWindow.is_active ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>{new Date(currentMealWindow.window_start).toLocaleTimeString()} - {new Date(currentMealWindow.window_end).toLocaleTimeString()}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Images submitted:</span>
                        <span>{currentMealWindow.current_images} / {currentMealWindow.min_images}</span>
                      </div>
                      <Progress 
                        value={(currentMealWindow.current_images / currentMealWindow.min_images) * 100} 
                        className="h-2"
                      />
                    </div>

                    {currentMealWindow.can_submit && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => router.push('/tracker')}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Submit Food Entry
                      </Button>
                    )}

                    {currentMealWindow.current_images >= currentMealWindow.min_images && (
                      <div className="flex items-center space-x-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Qualified for this meal!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Qualification Status */}
            {isUserParticipating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Your Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const userParticipant = stake.participants?.find(p => p.user_id === getCurrentUserId())
                    return userParticipant ? (
                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{userParticipant.calories_tracked}</p>
                          <p className="text-sm text-gray-500">Calories Tracked</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Images:</span>
                            <span>{userParticipant.images_submitted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Stake:</span>
                            <span>{userParticipant.amount} WLD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Qualified:</span>
                            <div className="flex items-center space-x-1">
                              {userParticipant.is_qualified ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-600">Yes</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                  <span className="text-orange-600">Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Leaderboard & Entries */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Live Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div key={entry.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getRankIcon(entry.rank)}
                          <div>
                            <p className="font-medium">{entry.username}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{entry.calories} cal</span>
                              <span>{entry.images_count} images</span>
                              <span>{entry.xp_earned} XP</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {entry.is_qualified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Qualified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No participants yet</p>
                )}
              </CardContent>
            </Card>

            {/* Food Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Food Entries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stakeEntries.length > 0 ? (
                  <div className="space-y-4">
                    {stakeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <img 
                          src={entry.image_url} 
                          alt={entry.food_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{entry.food_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>by {entry.username}</span>
                            <span>{entry.calories} cal</span>
                            <span>{entry.xp_earned} XP</span>
                            {entry.meal_type && (
                              <Badge variant="outline">{entry.meal_type}</Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No entries yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
