import { useState, useEffect } from 'react'

export function useDailyGoal(username: string | null) {
  const [dailyGoal, setDailyGoal] = useState<number>(2000) // Default 2000 calories

  useEffect(() => {
    if (!username) return

    const key = `dailyGoal_${username}`
    const storedGoal = localStorage.getItem(key)
    if (storedGoal) {
      setDailyGoal(parseInt(storedGoal, 10))
    }
  }, [username])

  const updateDailyGoal = (newGoal: number) => {
    setDailyGoal(newGoal)
    if (username) {
      const key = `dailyGoal_${username}`
      localStorage.setItem(key, newGoal.toString())
    }
  }

  return { dailyGoal, setDailyGoal: updateDailyGoal }
}
