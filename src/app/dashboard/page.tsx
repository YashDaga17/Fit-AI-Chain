'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BarChart3, Camera, Download, Flame, Sparkles, Target, Trophy, Zap } from 'lucide-react'

import Navigation from '@/components/Navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { useUserStats } from '@/hooks/useUserStats'
import { useWeeklyAnalytics } from '@/hooks/useWeeklyAnalytics'
import { getDailyTip, getMotivationalMessage, generateInsights } from '@/utils/tipsAndInsights'
import { getUserLevel, getXPProgress } from '@/utils/levelingSystem'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, username, isLoading } = useAuth()
  const { userStats, leaderboard, loading } = useUserStats(username)
  const { dailyGoal } = useDailyGoal(username)
  const { analytics, loading: analyticsLoading } = useWeeklyAnalytics(username)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!isAuthenticated || !username) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router, username])

  const levelInfo = userStats ? getUserLevel(userStats.totalXP || 0) : { level: 1, title: 'Beginner', badge: 'Starter' }
  const levelProgress = userStats
    ? getXPProgress(userStats.totalXP || 0)
    : { progressXP: 0, neededXP: 500, progressPercentage: 0, nextLevel: null }

  const calorieProgress = Math.min(Math.round((analytics.todayCalories / dailyGoal) * 100), 100)
  const remainingCalories = Math.max(dailyGoal - analytics.todayCalories, 0)
  const dailyTip = getDailyTip()
  const motivationalMessage = getMotivationalMessage()
  const exportToCSV = () => {
    if (!analytics || !analytics.dailyBreakdown?.length) {
    return
  }
  const headers = ['Date', 'Calories']

  const rows = analytics.dailyBreakdown.map((day) => [
    day.date,
    day.calories,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'nutrition-data.csv')

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

  const insightCards = useMemo(() => generateInsights({
    avgCalories: analytics.averageDailyCalories,
    avgProtein: 90,
    avgCarbs: 180,
    avgFat: 65,
    daysLogged: analytics.daysLogged,
  }, {
    calories: dailyGoal,
    protein: 120,
  }), [analytics.averageDailyCalories, analytics.daysLogged, dailyGoal])

  if (isLoading || loading || analyticsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600" />
          <p className="text-sm text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.20),_transparent_35%),linear-gradient(180deg,_#fff7ed_0%,_#fff1f2_100%)] pb-24">
      <div className="border-b border-orange-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Overview</Badge>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Nutrition Dashboard</h1>
              <p className="mt-2 text-slate-600">{motivationalMessage}</p>
            </div>
            <div className="flex gap-3">
              <Button className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600" onClick={() => router.push('/tracker')}>
                <Camera className="w-4 h-4" />
                Log a meal
              </Button>
              <Button variant="outline" className="rounded-2xl" onClick={() => router.push('/leaderboard')}>
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
              <Button
               variant="outline"
               className="rounded-2xl"
               onClick={exportToCSV}
               >
               <Download className="w-4 h-4" />
               Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-0 bg-white shadow-xl">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Today</p>
                  <h2 className="text-4xl font-bold text-slate-900">{analytics.todayCalories}</h2>
                  <p className="text-sm text-slate-500">calories logged today</p>
                </div>
                <div className="rounded-3xl bg-orange-50 p-4">
                  <Target className="h-7 w-7 text-orange-500" />
                </div>
              </div>
              <Progress value={calorieProgress} className="h-3 bg-orange-100" />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Goal</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{dailyGoal}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Remaining</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{remainingCalories}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Days Logged</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.daysLogged}/7</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/80">Level Progress</p>
                  <h3 className="text-2xl font-bold">{levelInfo.title}</h3>
                  <p className="text-sm text-white/80">Level {levelInfo.level} • {levelInfo.badge}</p>
                </div>
                <Sparkles className="h-7 w-7 text-white/90" />
              </div>
              <Progress value={levelProgress.progressPercentage} className="h-3 bg-white/20" />
              <div className="space-y-1 text-sm text-white/90">
                <p>{(userStats?.totalXP || 0).toLocaleString()} total XP</p>
                {levelProgress.nextLevel ? <p>{levelProgress.neededXP.toLocaleString()} XP to the next milestone</p> : null}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-5">
              <Flame className="mb-3 h-7 w-7 text-orange-500" />
              <p className="text-sm text-slate-500">Current streak</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.currentStreak}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-5">
              <Zap className="mb-3 h-7 w-7 text-red-500" />
              <p className="text-sm text-slate-500">Weekly XP</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.weeklyXP}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-5">
              <BarChart3 className="mb-3 h-7 w-7 text-amber-500" />
              <p className="text-sm text-slate-500">Weekly calories</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.weeklyCalories}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-5">
              <Trophy className="mb-3 h-7 w-7 text-yellow-500" />
              <p className="text-sm text-slate-500">Global rank</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">#{userStats?.rank || '--'}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Weekly trend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-3">
                {analytics.dailyBreakdown.map((day) => {
                  const height = Math.max(16, Math.round((day.calories / Math.max(dailyGoal, 1)) * 120))
                  const label = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })

                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2">
                      <div className="flex h-36 w-full items-end justify-center rounded-3xl bg-orange-50 px-2 py-3">
                        <div
                          className="w-full rounded-2xl bg-gradient-to-t from-orange-500 to-red-500"
                          style={{ height: `${Math.min(height, 120)}px` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <p className="text-xs text-slate-400">{day.calories} cal</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Average / day</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{analytics.averageDailyCalories}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Top meal type</p>
                  <p className="mt-2 text-xl font-bold capitalize text-slate-900">{analytics.topMealType}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Entries logged</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{userStats?.totalEntries || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insightCards.length > 0 ? insightCards.slice(0, 3).map((insight) => (
                  <div key={insight.title} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{insight.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{insight.message}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Keep logging</p>
                    <p className="mt-1 text-sm text-slate-600">A few more days of tracking will unlock better insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Daily tip</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 p-5">
                  <p className="text-2xl">{dailyTip.icon}</p>
                  <p className="mt-3 font-semibold text-slate-900">{dailyTip.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{dailyTip.content}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Your standing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Username</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">@{userStats?.username || username}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total calories tracked</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{userStats?.totalCalories || 0}</p>
              </div>
              <Button className="w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => router.push('/tracker')}>
                Open tracker
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Top performers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry.username} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-bold ${
                    index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-slate-300 text-slate-900' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{entry.username}</p>
                    <p className="text-sm text-slate-500">Level {entry.level} • {entry.totalXP.toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <Navigation />
    </div>
  )
}
