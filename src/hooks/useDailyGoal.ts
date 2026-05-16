'use client'

import { useState, useEffect, useCallback } from 'react'

const DEFAULT_DAILY_GOAL = 2000

function getStorageKey(username: string | null | undefined): string {
  return `daily_goal_${username || 'anonymous'}`
}

/**
 * Hook to manage a user's daily calorie goal.
 * Persists the value in localStorage per-username.
 */
export function useDailyGoal(username: string | null | undefined) {
  const [dailyGoal, setDailyGoalState] = useState(DEFAULT_DAILY_GOAL)

  // Load saved goal on mount / username change
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(getStorageKey(username))
      if (stored) {
        const parsed = Number.parseInt(stored, 10)
        if (Number.isInteger(parsed) && parsed >= 500 && parsed <= 10000) {
          setDailyGoalState(parsed)
          return
        }
      }
    } catch {
      // localStorage may be unavailable
    }

    setDailyGoalState(DEFAULT_DAILY_GOAL)
  }, [username])

  const setDailyGoal = useCallback(
    async (goal: number) => {
      const safeGoal = Math.max(500, Math.min(10000, goal))
      setDailyGoalState(safeGoal)

      try {
        localStorage.setItem(getStorageKey(username), String(safeGoal))
      } catch {
        // fail silently
      }
    },
    [username],
  )

  return { dailyGoal, setDailyGoal }
}
