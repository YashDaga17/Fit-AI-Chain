import { useCallback, useEffect, useState } from 'react'

import { normalizeUsername } from '@/lib/validation'
import type { WeeklyAnalytics } from '@/types/analytics'

const defaultAnalytics: WeeklyAnalytics = {
  todayCalories: 0,
  weeklyCalories: 0,
  averageDailyCalories: 0,
  weeklyXP: 0,
  daysLogged: 0,
  currentStreak: 0,
  dailyBreakdown: [],
  topMealType: 'No data yet',
}

export function useWeeklyAnalytics(username: string | null) {
  const [analytics, setAnalytics] = useState<WeeklyAnalytics>(defaultAnalytics)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    const normalizedUsername = normalizeUsername(username)
    if (!normalizedUsername) {
      setAnalytics(defaultAnalytics)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/analytics?username=${encodeURIComponent(normalizedUsername)}`)
      if (!response.ok) {
        throw new Error('Failed to load analytics')
      }

      const data = await response.json()
      setAnalytics(data.analytics || defaultAnalytics)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load analytics')
      setAnalytics(defaultAnalytics)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: loadAnalytics,
  }
}
