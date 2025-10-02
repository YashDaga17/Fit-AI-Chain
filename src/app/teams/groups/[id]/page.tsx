'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Users, Crown, Calendar, Trophy, TrendingUp, User, Medal, Target, Clock, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Group, GroupMember, Stake, GroupLeaderboardEntry, EnhancedFoodEntry } from '@/types/teams'

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardEntry[]>([])
  const [recentEntries, setRecentEntries] = useState<EnhancedFoodEntry[]>([])
  const [activeStakes, setActiveStakes] = useState<Stake[]>([])
  const [loading, setLoading] = useState(true)
  const [leaderboardType, setLeaderboardType] = useState<'daily' | 'weekly' | 'alltime'>('daily')

  useEffect(() => {
    if (groupId) {
      loadGroupData()
    }
  }, [groupId, leaderboardType])

  const loadGroupData = async () => {
    try {
      // Load group details
      const groupResponse = await fetch(`/api/groups?groupId=${groupId}`)
      if (groupResponse.ok) {
        const groupResult = await groupResponse.json()
        setGroup(groupResult.data)
      }

      // Load leaderboard
      const leaderboardResponse = await fetch(`/api/leaderboards?groupId=${groupId}&type=${leaderboardType}`)
      if (leaderboardResponse.ok) {
        const leaderboardResult = await leaderboardResponse.json()
        setLeaderboard(leaderboardResult.data || [])
      }

      // Load recent food entries
      const entriesResponse = await fetch(`/api/food-entries?groupId=${groupId}&limit=10`)
      if (entriesResponse.ok) {
        const entriesResult = await entriesResponse.json()
        setRecentEntries(entriesResult.data || [])
      }

      // Load active stakes
      const stakesResponse = await fetch(`/api/stakes?groupId=${groupId}&status=active`)
      if (stakesResponse.ok) {
        const stakesResult = await stakesResponse.json()
        setActiveStakes(stakesResult.data || [])
      }

    } catch (error) {
      console.error('Error loading group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-gray-600">#{rank}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Group Not Found</h2>
          <p className="text-gray-600 mb-4">The group you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/teams')}>Back to Teams</Button>
        </Card>
      </div>
    )
  }

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
                <Users className="h-6 w-6 text-orange-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
                  <p className="text-sm text-gray-600">{group.members?.length || 0} members</p>
                </div>
              </div>
            </div>

            <Button 
              size="sm" 
              onClick={() => router.push(`/teams/groups/${groupId}/stake`)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Coins className="h-4 w-4 mr-1" />
              Create Stake
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Group Info & Members */}
          <div className="space-y-6">
            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Group Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.description && (
                  <p className="text-gray-600 mb-4">{group.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Members:</span>
                    <span>{group.members?.length || 0} / {group.max_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <Badge variant={group.is_private ? 'secondary' : 'default'}>
                      {group.is_private ? 'Private' : 'Public'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(group.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{member.username}</span>
                      </div>
                      {member.role === 'admin' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Stakes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Active Stakes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeStakes.length > 0 ? (
                  <div className="space-y-3">
                    {activeStakes.map((stake) => (
                      <div 
                        key={stake.id} 
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/teams/stakes/${stake.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {stake.competition_type === 'daily' ? 'Daily Challenge' : `${stake.meal_type} Challenge`}
                          </span>
                          <span className="text-sm text-gray-500">
                            {stake.total_pool} WLD
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            {stake.participants?.length || 0} participants
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(stake.end_time).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No active stakes</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Leaderboard & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Leaderboard</span>
                  </CardTitle>
                  <div className="flex space-x-1">
                    {(['daily', 'weekly', 'alltime'] as const).map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={leaderboardType === type ? 'default' : 'ghost'}
                        onClick={() => setLeaderboardType(type)}
                        className={leaderboardType === type ? 'bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
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
                              <span>{entry.images_count} entries</span>
                              <span>{entry.xp_earned} XP</span>
                            </div>
                          </div>
                        </div>
                        {entry.is_qualified && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Qualified
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No activity yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentEntries.length > 0 ? (
                  <div className="space-y-4">
                    {recentEntries.map((entry) => (
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
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
