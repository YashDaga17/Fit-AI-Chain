'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Trash2,
  Zap,
  Calendar,
  TrendingUp,
  Filter,
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import ExerciseLogger from '@/components/ExerciseLogger'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useUserStats } from '@/hooks/useUserStats'
import { INTENSITY_MULTIPLIERS, type IntensityLevel } from '@/utils/exerciseDatabase'

interface ExerciseLogEntry {
  id: number
  username: string
  exerciseName: string
  duration: number
  caloriesBurned: number
  intensity: string | null
  category: string | null
  date: string
  createdAt: string | Date
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  cardio: { bg: 'bg-blue-100', text: 'text-blue-700' },
  strength: { bg: 'bg-purple-100', text: 'text-purple-700' },
  flexibility: { bg: 'bg-amber-100', text: 'text-amber-700' },
  sports: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

function getCategoryStyle(category: string | null) {
  return categoryColors[category || ''] || { bg: 'bg-slate-100', text: 'text-slate-700' }
}

function formatIntensityLabel(intensity: string | null): string {
  if (!intensity) return 'Medium'
  const info = INTENSITY_MULTIPLIERS[intensity as IntensityLevel]
  return info?.label || intensity.charAt(0).toUpperCase() + intensity.slice(1)
}

type DateFilter = 'today' | 'week' | 'all'

export default function ExercisePage() {
  const router = useRouter()
  const { isAuthenticated, username, isLoading } = useAuth()
  const { userStats } = useUserStats(username)
  const [mounted, setMounted] = useState(false)
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadLogs = useCallback(async () => {
    if (!username) return

    setIsLoadingLogs(true)
    try {
      let url = `/api/exercise?username=${encodeURIComponent(username)}`
      if (dateFilter === 'today') {
        url += `&date=${new Date().toLocaleDateString('en-CA')}`
      } else if (dateFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        // For 'week' we just fetch all and filter client-side for simplicity
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        let entries = data.logs || []

        if (dateFilter === 'week') {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          const weekAgoStr = weekAgo.toLocaleDateString('en-CA')
          entries = entries.filter((log: ExerciseLogEntry) => log.date >= weekAgoStr)
        }

        setLogs(entries)
      }
    } catch {
      // silent fail
    } finally {
      setIsLoadingLogs(false)
    }
  }, [username, dateFilter])

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !username) {
      router.push('/')
      return
    }
    loadLogs()
  }, [isAuthenticated, isLoading, loadLogs, router, username])

  const todaysLogs = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA')
    return logs.filter((log) => log.date === today)
  }, [logs])

  const todayCaloriesBurned = useMemo(
    () => todaysLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0),
    [todaysLogs]
  )

  const todayDuration = useMemo(
    () => todaysLogs.reduce((sum, log) => sum + (log.duration || 0), 0),
    [todaysLogs]
  )

  const totalCaloriesBurned = useMemo(
    () => logs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0),
    [logs]
  )

  const handleDelete = async (log: ExerciseLogEntry) => {
    const confirmed = window.confirm(`Delete "${log.exerciseName}" from your log?`)
    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/exercise?id=${log.id}&username=${encodeURIComponent(username!)}`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        setLogs((current) => current.filter((item) => item.id !== log.id))
      }
    } catch {
      // silent fail
    }
  }

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-7 h-7 text-emerald-700" />
          </div>
          <p className="text-emerald-700">
            {isLoading ? 'Checking authentication...' : 'Loading exercises...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(180deg,_#ecfdf5_0%,_#f0fdfa_100%)]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-emerald-600">Workout tracker</p>
            <h1 className="text-2xl font-bold text-slate-900">Exercise</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">{username}</p>
            <p className="text-lg font-semibold text-slate-900">
              {(userStats?.totalXP || 0).toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6">
        {/* Today's summary cards */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 bg-white shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-600">Burned Today</p>
                  <p className="text-2xl font-bold text-slate-900">{todayCaloriesBurned} cal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-600">Active Today</p>
                  <p className="text-2xl font-bold text-slate-900">{todayDuration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-purple-600">Workouts</p>
                  <p className="text-2xl font-bold text-slate-900">{todaysLogs.length} today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Logger */}
        <ExerciseLogger username={username!} onLogSaved={loadLogs} />

        {/* History section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Exercise History</h2>
              <p className="text-sm text-slate-500">View and manage your logged workouts</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              {logs.length} logged
            </Badge>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {(['today', 'week', 'all'] as DateFilter[]).map((filter) => (
              <Button
                key={filter}
                variant={dateFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter(filter)}
                className={`rounded-2xl ${
                  dateFilter === filter ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''
                }`}
              >
                {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'All Time'}
              </Button>
            ))}
          </div>

          {/* Filtered summary */}
          {logs.length > 0 && (
            <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
              <CardContent className="p-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-white/80">Total Burned</p>
                    <p className="text-2xl font-bold">{totalCaloriesBurned} cal</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Workouts</p>
                    <p className="text-2xl font-bold">{logs.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Total Time</p>
                    <p className="text-2xl font-bold">
                      {logs.reduce((sum, l) => sum + l.duration, 0)}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Log list */}
          {isLoadingLogs ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </CardContent>
            </Card>
          ) : logs.length === 0 ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-10 text-center">
                <Dumbbell className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
                <h3 className="text-lg font-semibold text-slate-900">No exercises logged yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Use the form above to log your first workout!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const catStyle = getCategoryStyle(log.category)
                return (
                  <Card key={log.id} className="border-0 bg-white shadow-lg overflow-hidden">
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Icon */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
                        <Dumbbell className="h-6 w-6 text-emerald-600" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{log.exerciseName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {log.duration}m
                          </Badge>
                          <Badge className={`text-xs ${catStyle.bg} ${catStyle.text} hover:${catStyle.bg}`}>
                            {log.category || 'other'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="mr-1 h-3 w-3" />
                            {formatIntensityLabel(log.intensity)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          <Calendar className="mr-1 inline h-3 w-3" />
                          {log.date}
                        </p>
                      </div>

                      {/* Calories + delete */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">
                            {log.caloriesBurned}
                          </p>
                          <p className="text-xs text-slate-500">cal burned</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(log)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          aria-label={`Delete ${log.exerciseName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Navigation />
    </div>
  )
}
