import { useState, useEffect, useCallback } from 'react'

interface UserStats {
  totalCalories: number
  totalXP: number
  streak: number
  level: number
  rank: number
  username: string
  totalEntries: number
}

interface LeaderboardEntry {
  rank: number
  username: string
  totalXP: number
  level: number
  totalCalories: number
  streak: number
  joinedAt: string
  totalEntries: number
}

export function useUserStats(username: string | null) {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStats = useCallback(async (username: string) => {
    try {
      const response = await fetch(`/api/user/sync?username=${username}`)
      if (!response.ok) {
        if (response.status === 404) {
          // User not found, try to create them
          const syncResponse = await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          })
          
          if (syncResponse.ok) {
            const syncData = await syncResponse.json()
            return syncData.user
          }
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.user
    } catch (error: any) {
      setError(error.message || 'Failed to fetch user stats')
      return null
    }
  }, [])

  const fetchLeaderboard = useCallback(async (limit: number = 100) => {
    try {
      const response = await fetch(`/api/leaderboard-db?limit=${limit}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        // Return empty array instead of throwing error for leaderboard
        return []
      }
      
      const data = await response.json()
      return data.leaderboard || []
    } catch (error: any) {
      // Don't set error for leaderboard failures, just return empty array
      return []
    }
  }, [])

  const updateUserStats = useCallback(async (username: string, updates: Partial<UserStats>) => {
    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ...updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user stats')
      }

      const data = await response.json()
      setUserStats(data.user)
      return data.user
    } catch (error: any) {
      setError(error.message || 'Failed to update user stats')
      return null
    }
  }, [])

  const loadData = useCallback(async (retryCount = 0) => {
    if (!username) return

    setLoading(true)
    setError(null)

    try {
      const [stats, leaderboardData] = await Promise.all([
        fetchUserStats(username),
        fetchLeaderboard()
      ])

      if (stats) {
        setUserStats(stats)
      }
      setLeaderboard(leaderboardData)
    } catch (error: any) {
      
      // Retry once for new users
      if (retryCount === 0 && error.message.includes('Failed to fetch')) {
        setTimeout(() => loadData(1), 1000)
        return
      }
      
      setError(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [username, fetchUserStats, fetchLeaderboard])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refreshData = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    userStats,
    leaderboard,
    loading,
    error,
    updateUserStats,
    refreshData,
    clearError: () => setError(null)
  }
}
