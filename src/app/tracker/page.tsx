'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Flame, Loader2, Pencil, Plus, Search, Target, Trash2, UtensilsCrossed, X, Zap } from 'lucide-react'

import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useDailyGoal } from '@/hooks/useDailyGoal'
import { useFoodAnalysis } from '@/hooks/useFoodAnalysis'
import { useUserStats } from '@/hooks/useUserStats'
import type { FoodEntry, FoodEntryFormValues } from '@/types/tracker'
import { FOOD_TRACKING_LEVELS, getUserLevel, getXPProgress } from '@/utils/levelingSystem'

const DEFAULT_FORM_VALUES: FoodEntryFormValues = {
  food: '',
  calories: '',
  mealType: 'meal',
  portionSize: '',
  cuisine: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
}

function createEmptyForm(): FoodEntryFormValues {
  return { ...DEFAULT_FORM_VALUES }
}

function formFromEntry(entry: FoodEntry): FoodEntryFormValues {
  return {
    food: entry.food,
    calories: String(entry.calories),
    mealType: entry.mealType || 'meal',
    portionSize: entry.portionSize || '',
    cuisine: entry.cuisine || '',
    protein: entry.nutrients?.protein || '',
    carbs: entry.nutrients?.carbs || '',
    fat: entry.nutrients?.fat || '',
    fiber: entry.nutrients?.fiber || '',
  }
}

function formatMealType(mealType?: string) {
  if (!mealType) {
    return 'Meal'
  }

  return mealType.charAt(0).toUpperCase() + mealType.slice(1)
}

const mealFilterOptions = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'meal'] as const

export default function TrackerPage() {
  const router = useRouter()
  const { isAuthenticated, username, isLoading } = useAuth()
  const { userStats, refreshData } = useUserStats(username)
  const { dailyGoal, setDailyGoal } = useDailyGoal(username)
  const {
    isAnalyzing,
    error: analysisError,
    analyzeFood,
    getFoodEntries,
    createManualEntry,
    updateFoodEntry,
    deleteFoodEntry,
    clearError,
  } = useFoodAnalysis()

  const [mounted, setMounted] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [isSavingEntry, setIsSavingEntry] = useState(false)
  const [entryForm, setEntryForm] = useState<FoodEntryFormValues>(createEmptyForm())
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [goalDraft, setGoalDraft] = useState(String(dailyGoal))
  const [searchQuery, setSearchQuery] = useState('')
  const [mealFilter, setMealFilter] = useState<(typeof mealFilterOptions)[number]>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setGoalDraft(String(dailyGoal))
  }, [dailyGoal])

  const loadFoodEntries = useCallback(async () => {
    if (!username) {
      return
    }

    const entries = await getFoodEntries(username)
    setFoodEntries(entries)
  }, [getFoodEntries, username])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!isAuthenticated || !username) {
      router.push('/')
      return
    }

    loadFoodEntries()
  }, [isAuthenticated, isLoading, loadFoodEntries, router, username])

  const todaysEntries = useMemo(() => {
    const today = new Date().toDateString()
    return foodEntries.filter((entry) => new Date(entry.timestamp).toDateString() === today)
  }, [foodEntries])

  const todaysCalories = useMemo(() => todaysEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0), [todaysEntries])
  const todaysXP = useMemo(() => todaysEntries.reduce((sum, entry) => sum + (entry.xp || 0), 0), [todaysEntries])
  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return foodEntries.filter((entry) => {
      const matchesMealType = mealFilter === 'all' || (entry.mealType || 'meal') === mealFilter
      const haystack = [
        entry.food,
        entry.cuisine,
        entry.portionSize,
        entry.cookingMethod,
        ...(entry.ingredients || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery)
      return matchesMealType && matchesQuery
    })
  }, [foodEntries, mealFilter, searchQuery])

  const filteredCalories = useMemo(
    () => filteredEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0),
    [filteredEntries]
  )
  const calorieProgress = Math.min(Math.round((todaysCalories / dailyGoal) * 100), 100)
  const remainingCalories = Math.max(dailyGoal - todaysCalories, 0)
  const levelInfo = mounted && userStats ? getUserLevel(userStats.totalXP || 0) : FOOD_TRACKING_LEVELS[0]
  const xpProgress = mounted && userStats
    ? getXPProgress(userStats.totalXP || 0)
    : {
        currentLevel: FOOD_TRACKING_LEVELS[0],
        nextLevel: FOOD_TRACKING_LEVELS[1],
        progressXP: 0,
        neededXP: 500,
        progressPercentage: 0,
      }

  const updateFormField = <K extends keyof FoodEntryFormValues>(field: K, value: FoodEntryFormValues[K]) => {
    setEntryForm((current) => ({ ...current, [field]: value }))
  }

  const openCreateDialog = () => {
    setEditingEntryId(null)
    setEntryForm(createEmptyForm())
    setIsEntryDialogOpen(true)
  }

  const openEditDialog = (entry: FoodEntry) => {
    setEditingEntryId(entry.id)
    setEntryForm(formFromEntry(entry))
    setIsEntryDialogOpen(true)
  }

  const resetEntryDialog = () => {
    setEditingEntryId(null)
    setEntryForm(createEmptyForm())
    setIsEntryDialogOpen(false)
  }

  const refreshTrackerData = async () => {
    await Promise.all([loadFoodEntries(), Promise.resolve(refreshData())])
  }

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = async (loadEvent) => {
      const imageData = loadEvent.target?.result as string
      setSelectedImage(imageData)

      const newEntry = await analyzeFood(imageData)
      if (newEntry) {
        setFoodEntries((current) => [newEntry, ...current])
        refreshData()
      }

      setSelectedImage(null)
      event.target.value = ''
    }

    reader.readAsDataURL(file)
  }, [analyzeFood, refreshData])

  const handleSaveEntry = async () => {
    const calories = Number.parseInt(entryForm.calories, 10)
    if (!entryForm.food.trim() || !Number.isFinite(calories) || calories <= 0) {
      return
    }

    setIsSavingEntry(true)

    const payload = {
      food: entryForm.food.trim(),
      calories,
      mealType: entryForm.mealType,
      portionSize: entryForm.portionSize.trim() || undefined,
      cuisine: entryForm.cuisine.trim() || undefined,
      nutrients: {
        protein: entryForm.protein.trim() || '0g',
        carbs: entryForm.carbs.trim() || '0g',
        fat: entryForm.fat.trim() || '0g',
        fiber: entryForm.fiber.trim() || '0g',
      },
      xp: Math.max(10, Math.round(calories / 4)),
      image: '/placeholder-food.jpg',
      confidence: 'manual',
    }

    const savedEntry = editingEntryId
      ? await updateFoodEntry(editingEntryId, payload)
      : await createManualEntry(payload)

    if (savedEntry) {
      await refreshTrackerData()
      resetEntryDialog()
    }

    setIsSavingEntry(false)
  }

  const handleDeleteEntry = async (entry: FoodEntry) => {
    const confirmed = window.confirm(`Delete "${entry.food}" from your log?`)
    if (!confirmed) {
      return
    }

    const deleted = await deleteFoodEntry(entry.id)
    if (deleted) {
      setFoodEntries((current) => current.filter((item) => item.id !== entry.id))
      refreshData()
    }
  }

  const handleSaveGoal = async () => {
    const parsedGoal = Number.parseInt(goalDraft, 10)
    await setDailyGoal(parsedGoal)
    setIsGoalDialogOpen(false)
  }

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7 text-orange-700" />
          </div>
          <p className="text-orange-700">{isLoading ? 'Checking authentication...' : 'Loading tracker...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.24),_transparent_40%),linear-gradient(180deg,_#fff7ed_0%,_#fff1f2_100%)]">
      <div className="sticky top-0 z-30 border-b border-orange-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-orange-600">Daily nutrition cockpit</p>
            <h1 className="text-2xl font-bold text-slate-900">Food Tracker</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">{username}</p>
            <p className="text-lg font-semibold text-slate-900">{(userStats?.totalXP || 0).toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6">
        {analysisError && (
          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <p className="text-sm text-red-700">{analysisError}</p>
              <Button variant="outline" size="sm" onClick={clearError}>Dismiss</Button>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <Card className="overflow-hidden border-0 bg-white shadow-xl">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Today</p>
                  <h2 className="text-3xl font-bold text-slate-900">{todaysCalories} cal</h2>
                  <p className="text-sm text-slate-500">{remainingCalories} calories remaining from your {dailyGoal} goal</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsGoalDialogOpen(true)}>
                  <Target className="w-4 h-4" />
                  Edit Goal
                </Button>
              </div>

              <Progress value={calorieProgress} className="h-3 bg-orange-100" />

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-orange-600">Meals Logged</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{todaysEntries.length}</p>
                </div>
                <div className="rounded-2xl bg-red-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-red-600">XP Today</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{todaysXP}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-amber-600">Streak</p>
                  <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
                    <Flame className="w-5 h-5 text-orange-500" />
                    {userStats?.streak || 1}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-sm text-white/80">Level Progress</p>
                <h3 className="text-2xl font-bold">{levelInfo.title}</h3>
                <p className="text-sm text-white/80">{levelInfo.badge} • Level {levelInfo.level}</p>
              </div>
              <Progress value={xpProgress.progressPercentage} className="h-3 bg-white/20" />
              <p className="text-sm text-white/90">
                {xpProgress.progressXP.toLocaleString()} XP in this level
                {xpProgress.nextLevel ? ` • ${xpProgress.neededXP.toLocaleString()} XP to ${xpProgress.nextLevel.title}` : ''}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-0 bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Camera className="w-5 h-5 text-orange-500" />
                AI Food Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/70 px-6 py-10 text-center transition hover:border-orange-300 hover:bg-orange-50">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isAnalyzing}
                />
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mb-3 h-10 w-10 animate-spin text-orange-500" />
                    <p className="font-semibold text-slate-900">Analyzing your meal...</p>
                    <p className="text-sm text-slate-500">We’re estimating calories, nutrients, and XP.</p>
                  </>
                ) : (
                  <>
                    <div className="mb-3 rounded-3xl bg-white p-4 shadow-sm">
                      <Camera className="h-8 w-8 text-orange-500" />
                    </div>
                    <p className="font-semibold text-slate-900">Take a food photo</p>
                    <p className="text-sm text-slate-500">Use AI to log a meal from your camera in one tap.</p>
                  </>
                )}
              </label>

              {selectedImage && (
                <div className="overflow-hidden rounded-2xl border border-orange-100">
                  <img src={selectedImage} alt="Selected food preview" className="h-44 w-full object-cover" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Plus className="w-5 h-5 text-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="h-12 w-full justify-start rounded-2xl bg-slate-900 text-white hover:bg-slate-800" onClick={openCreateDialog}>
                <Plus className="w-4 h-4" />
                Add meal manually
              </Button>
              <Button variant="outline" className="h-12 w-full justify-start rounded-2xl" onClick={() => setIsGoalDialogOpen(true)}>
                <Target className="w-4 h-4" />
                Update daily goal
              </Button>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Today’s focus</p>
                <p className="mt-1 text-sm text-slate-600">
                  Manual logging, edit/delete controls, and goal tracking are now built into the tracker so you’re not blocked on AI scans.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Meals</h2>
              <p className="text-sm text-slate-500">Search, filter, and manage your meal history.</p>
            </div>
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{foodEntries.length} total</Badge>
          </div>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by meal, ingredient, cuisine, or cooking method"
                    className="rounded-2xl pl-9 pr-10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                  {mealFilterOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={mealFilter === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMealFilter(option)}
                      className={`rounded-2xl ${mealFilter === option ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
                    >
                      {option === 'all' ? 'All' : formatMealType(option)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Shown Meals</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{filteredEntries.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Shown Calories</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{filteredCalories}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Active Filter</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{mealFilter === 'all' ? 'Everything' : formatMealType(mealFilter)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {foodEntries.length === 0 ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-10 text-center">
                <UtensilsCrossed className="mx-auto mb-4 h-10 w-10 text-orange-400" />
                <h3 className="text-lg font-semibold text-slate-900">No meals logged yet</h3>
                <p className="mt-2 text-sm text-slate-500">Start with a camera scan or add your first meal manually.</p>
                <Button className="mt-4 rounded-2xl bg-orange-500 text-white hover:bg-orange-600" onClick={openCreateDialog}>
                  Add first meal
                </Button>
              </CardContent>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-10 text-center">
                <Search className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900">No meals match this filter</h3>
                <p className="mt-2 text-sm text-slate-500">Try a different search term or switch the meal filter back to all.</p>
                <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => {
                  setSearchQuery('')
                  setMealFilter('all')
                }}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredEntries.slice(0, 8).map((entry) => (
                <Card key={entry.id} className="overflow-hidden border-0 bg-white shadow-lg">
                  <div className="flex h-full flex-col">
                    <div className="relative h-44 bg-gradient-to-br from-orange-100 to-red-100">
                      <img src={entry.image || '/placeholder-food.jpg'} alt={entry.food} className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-lg font-semibold text-white">{entry.food}</p>
                        <p className="text-sm text-white/80">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    <CardContent className="flex flex-1 flex-col gap-4 p-5">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{formatMealType(entry.mealType)}</Badge>
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{entry.calories} cal</Badge>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          <Zap className="mr-1 h-3 w-3" />
                          {entry.xp} XP
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Cuisine</p>
                          <p className="mt-1 font-medium text-slate-900">{entry.cuisine || 'General'}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Portion</p>
                          <p className="mt-1 font-medium text-slate-900">{entry.portionSize || 'Standard'}</p>
                        </div>
                      </div>

                      {entry.nutrients && (
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="rounded-2xl bg-orange-50 p-2">
                            <p className="text-slate-500">Protein</p>
                            <p className="mt-1 font-semibold text-slate-900">{entry.nutrients.protein}</p>
                          </div>
                          <div className="rounded-2xl bg-orange-50 p-2">
                            <p className="text-slate-500">Carbs</p>
                            <p className="mt-1 font-semibold text-slate-900">{entry.nutrients.carbs}</p>
                          </div>
                          <div className="rounded-2xl bg-orange-50 p-2">
                            <p className="text-slate-500">Fat</p>
                            <p className="mt-1 font-semibold text-slate-900">{entry.nutrients.fat}</p>
                          </div>
                          <div className="rounded-2xl bg-orange-50 p-2">
                            <p className="text-slate-500">Fiber</p>
                            <p className="mt-1 font-semibold text-slate-900">{entry.nutrients.fiber}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => openEditDialog(entry)}>
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" className="flex-1 rounded-2xl" onClick={() => handleDeleteEntry(entry)}>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={isEntryDialogOpen} onOpenChange={(open) => (open ? setIsEntryDialogOpen(true) : resetEntryDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntryId ? 'Edit meal' : 'Add manual meal'}</DialogTitle>
            <DialogDescription>
              Keep your log accurate even when you don’t want to use the camera flow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Food name</label>
              <Input value={entryForm.food} onChange={(event) => updateFormField('food', event.target.value)} placeholder="Grilled chicken bowl" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Calories</label>
                <Input type="number" min="0" value={entryForm.calories} onChange={(event) => updateFormField('calories', event.target.value)} placeholder="540" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Meal type</label>
                <select
                  value={entryForm.mealType}
                  onChange={(event) => updateFormField('mealType', event.target.value)}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"
                >
                  <option value="meal">Meal</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Portion size</label>
                <Input value={entryForm.portionSize} onChange={(event) => updateFormField('portionSize', event.target.value)} placeholder="1 bowl" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Cuisine</label>
                <Input value={entryForm.cuisine} onChange={(event) => updateFormField('cuisine', event.target.value)} placeholder="Indian" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Protein</label>
                <Input value={entryForm.protein} onChange={(event) => updateFormField('protein', event.target.value)} placeholder="30g" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Carbs</label>
                <Input value={entryForm.carbs} onChange={(event) => updateFormField('carbs', event.target.value)} placeholder="45g" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Fat</label>
                <Input value={entryForm.fat} onChange={(event) => updateFormField('fat', event.target.value)} placeholder="18g" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Fiber</label>
                <Input value={entryForm.fiber} onChange={(event) => updateFormField('fiber', event.target.value)} placeholder="8g" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetEntryDialog}>Cancel</Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={handleSaveEntry} disabled={isSavingEntry}>
              {isSavingEntry ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingEntryId ? 'Save changes' : 'Add meal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set daily calorie goal</DialogTitle>
            <DialogDescription>Choose a target that matches your current nutrition plan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Calories per day</label>
            <Input type="number" min="500" max="10000" value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>Cancel</Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={handleSaveGoal}>Save goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-24 right-6 z-20">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isAnalyzing}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-2xl transition hover:scale-105">
            {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          </div>
        </label>
      </div>

      <Navigation />
    </div>
  )
}
