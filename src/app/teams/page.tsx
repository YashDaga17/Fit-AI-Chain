'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Plus, Search, Trophy, Coins, Clock, User, Target, Medal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Group, Stake, User as UserType, UserSearchResult } from '@/types/teams'

export default function TeamsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'groups' | 'stakes'>('groups')
  const [groups, setGroups] = useState<Group[]>([])
  const [stakes, setStakes] = useState<Stake[]>([])
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isCreateStakeOpen, setIsCreateStakeOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [selectedGroupForStake, setSelectedGroupForStake] = useState<number | null>(null)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      // Get current user from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (!userData.verification?.verified) {
        router.push('/')
        return
      }

      // Create or get user in database
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.verification.username || userData.verification.address?.slice(-6) || 'User',
          wallet_address: userData.verification.address,
          nullifier_hash: userData.verification.nullifierHash,
          verification_type: userData.verification.verificationType || 'guest'
        })
      })

      if (userResponse.ok) {
        const userResult = await userResponse.json()
        setCurrentUser(userResult.data)

        // Load user's groups and stakes
        await loadGroups(userResult.data.id)
        await loadStakes(userResult.data.id)
      }
    } catch (error) {
      console.error('Error initializing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async (userId: number) => {
    try {
      const response = await fetch(`/api/groups?userId=${userId}`)
      if (response.ok) {
        const result = await response.json()
        setGroups(result.data || [])
      }
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  const loadStakes = async (userId: number) => {
    try {
      const response = await fetch(`/api/stakes?userId=${userId}&status=active`)
      if (response.ok) {
        const result = await response.json()
        setStakes(result.data || [])
      }
    } catch (error) {
      console.error('Error loading stakes:', error)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim() || !currentUser) return
    
    try {
      const response = await fetch(`/api/users?q=${encodeURIComponent(query)}&currentUserId=${currentUser.id}`)
      if (response.ok) {
        const result = await response.json()
        setSearchResults(result.data || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const createGroup = async () => {
    if (!newGroupName.trim() || !currentUser) return

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          creator_id: currentUser.id,
          is_private: true,
          max_members: 10
        })
      })

      if (response.ok) {
        await loadGroups(currentUser.id)
        setIsCreateGroupOpen(false)
        setNewGroupName('')
        setNewGroupDescription('')
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const createStake = async (groupId: number, competitionType: 'daily' | 'meal', mealType?: string) => {
    if (!currentUser) return

    const stakeAmount = 1.0 // Default stake amount (could be user input)
    const startTime = new Date().toISOString()

    try {
      const response = await fetch('/api/stakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: groupId,
          creator_id: currentUser.id,
          competition_type: competitionType,
          meal_type: mealType,
          stake_amount: stakeAmount,
          start_time: startTime
        })
      })

      if (response.ok) {
        await loadStakes(currentUser.id)
        setIsCreateStakeOpen(false)
        setSelectedGroupForStake(null)
      }
    } catch (error) {
      console.error('Error creating stake:', error)
    }
  }

  const joinStake = async (stakeId: number) => {
    if (!currentUser) return

    const amount = 1.0 // Default amount

    try {
      const response = await fetch('/api/stakes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stake_id: stakeId,
          user_id: currentUser.id,
          amount
        })
      })

      if (response.ok) {
        await loadStakes(currentUser.id)
      }
    } catch (error) {
      console.error('Error joining stake:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
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
                onClick={() => router.back()}
                className="hover:bg-orange-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">Teams & Stakes</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                    <Button onClick={createGroup} className="w-full">
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4">
            <Button
              variant={activeTab === 'groups' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('groups')}
              className={activeTab === 'groups' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Users className="h-4 w-4 mr-1" />
              Groups
            </Button>
            <Button
              variant={activeTab === 'stakes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('stakes')}
              className={activeTab === 'stakes' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Trophy className="h-4 w-4 mr-1" />
              Stakes
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* User Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Find Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length > 2) {
                    searchUsers(e.target.value)
                  } else {
                    setSearchResults([])
                  }
                }}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">Level {user.level} • {user.total_xp} XP</p>
                      </div>
                    </div>
                    <Badge variant={user.verification_type === 'worldid' ? 'default' : 'secondary'}>
                      {user.verification_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="space-y-4">
            {groups.length > 0 ? (
              groups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        {group.description && (
                          <p className="text-gray-600 mt-1">{group.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{group.member_count || 0} members</span>
                          <span>Max: {group.max_members}</span>
                          <Badge variant={group.is_private ? 'secondary' : 'default'}>
                            {group.is_private ? 'Private' : 'Public'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/teams/groups/${group.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedGroupForStake(group.id)
                            setIsCreateStakeOpen(true)
                          }}
                        >
                          <Coins className="h-4 w-4 mr-1" />
                          Stake
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Groups Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first group to start competing with friends!</p>
                  <Button onClick={() => setIsCreateGroupOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stakes Tab */}
        {activeTab === 'stakes' && (
          <div className="space-y-4">
            {stakes.length > 0 ? (
              stakes.map((stake) => (
                <Card key={stake.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                          <h3 className="font-semibold text-lg">
                            {stake.competition_type === 'daily' ? 'Daily Challenge' : `${stake.meal_type} Challenge`}
                          </h3>
                          <Badge variant="outline">{stake.group_name}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Coins className="h-4 w-4 mr-1" />
                            {stake.total_pool} WLD Pool
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Ends: {new Date(stake.end_time).toLocaleString()}
                          </span>
                          <span>{stake.participants?.length || 0} participants</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/teams/stakes/${stake.id}`)}
                        >
                          View
                        </Button>
                        {!stake.participants?.some(p => p.user_id === currentUser?.id) && (
                          <Button
                            size="sm"
                            onClick={() => joinStake(stake.id)}
                          >
                            <Target className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Active Stakes</h3>
                  <p className="text-gray-600 mb-4">Join a group and create stakes to compete with others!</p>
                  <Button onClick={() => setActiveTab('groups')}>
                    <Users className="h-4 w-4 mr-1" />
                    View Groups
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Create Stake Dialog */}
        <Dialog open={isCreateStakeOpen} onOpenChange={setIsCreateStakeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Stake</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => createStake(selectedGroupForStake!, 'daily')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Clock className="h-6 w-6 mb-1" />
                  <span>Daily Challenge</span>
                  <span className="text-xs text-gray-500">24 hours</span>
                </Button>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => createStake(selectedGroupForStake!, 'meal', 'breakfast')}
                    className="w-full"
                  >
                    🌅 Breakfast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => createStake(selectedGroupForStake!, 'meal', 'lunch')}
                    className="w-full"
                  >
                    ☀️ Lunch
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => createStake(selectedGroupForStake!, 'meal', 'dinner')}
                    className="w-full"
                  >
                    🌙 Dinner
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
