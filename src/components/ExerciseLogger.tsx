'use client'

import { useState, useMemo } from 'react'
import { Dumbbell, Flame, Clock, Zap, Search, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  EXERCISE_DATABASE,
  INTENSITY_MULTIPLIERS,
  calculateCaloriesBurned,
  type ExerciseDefinition,
  type IntensityLevel,
} from '@/utils/exerciseDatabase'

interface ExerciseLoggerProps {
  username: string
  onLogSaved: (log?: any) => void
}

export default function ExerciseLogger({ username, onLogSaved }: ExerciseLoggerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null)
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState<IntensityLevel>('medium')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return EXERCISE_DATABASE
    return EXERCISE_DATABASE.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(query) ||
        exercise.category.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const durationMinutes = Number.parseInt(duration, 10)
  const isValidDuration = Number.isFinite(durationMinutes) && durationMinutes > 0

  const estimatedCalories = useMemo(() => {
    if (!selectedExercise || !isValidDuration) return 0
    return calculateCaloriesBurned(durationMinutes, selectedExercise.caloriesPerMin, intensity)
  }, [selectedExercise, durationMinutes, isValidDuration, intensity])

  const handleSelectExercise = (exercise: ExerciseDefinition) => {
    setSelectedExercise(exercise)
    setSearchQuery(exercise.name)
    setShowDropdown(false)
  }

  const handleClearSelection = () => {
    setSelectedExercise(null)
    setSearchQuery('')
    setDuration('')
    setIntensity('medium')
    setError(null)
  }

  const handleSave = async () => {
    if (!selectedExercise || !isValidDuration) return

    setIsSaving(true)
    setError(null)

    try {
      const today = new Date().toISOString().slice(0, 10)

      const response = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          exerciseName: selectedExercise.name,
          duration: durationMinutes,
          caloriesBurned: estimatedCalories,
          intensity,
          category: selectedExercise.category,
          date: today,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to save exercise log')
      }

      const data = await response.json()

      // Reset form
      handleClearSelection()
      onLogSaved(data.log)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-0 bg-white shadow-xl overflow-hidden">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Log Exercise</h3>
            <p className="text-sm text-slate-500">Track your workouts and calories burned</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Close error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Exercise search / selection */}
        <div className="space-y-2">
          <label htmlFor="search-exercise" className="text-sm font-medium text-slate-700">Exercise</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="search-exercise"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowDropdown(true)
                if (selectedExercise && e.target.value !== selectedExercise.name) {
                  setSelectedExercise(null)
                }
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search exercises (e.g. Running, Yoga)"
              className="rounded-2xl pl-9 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Dropdown */}
            {showDropdown && !selectedExercise && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {filteredExercises.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-500">No exercises found</p>
                ) : (
                  filteredExercises.map((exercise) => (
                    <button
                      key={exercise.name}
                      type="button"
                      onClick={() => handleSelectExercise(exercise)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-emerald-50"
                    >
                      <span className="text-lg">{exercise.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{exercise.name}</p>
                        <p className="text-xs text-slate-500">
                          {exercise.caloriesPerMin} cal/min · {exercise.category}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedExercise && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              {selectedExercise.icon} {selectedExercise.name} · {selectedExercise.caloriesPerMin} cal/min
            </Badge>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label htmlFor="exercise-duration" className="text-sm font-medium text-slate-700">Duration (minutes)</label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="exercise-duration"
              type="number"
              min="1"
              max="600"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              className="rounded-2xl pl-9"
            />
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Intensity</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(INTENSITY_MULTIPLIERS) as [IntensityLevel, typeof INTENSITY_MULTIPLIERS[IntensityLevel]][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIntensity(key)}
                  className={`rounded-2xl border-2 p-3 text-center transition-all ${intensity === key
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <p className={`text-sm font-semibold ${intensity === key ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {info.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">×{info.multiplier}</p>
                </button>
              )
            )}
          </div>
        </div>

        {/* Live preview */}
        {selectedExercise && isValidDuration && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">Duration</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-slate-900">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  {durationMinutes}m
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">Intensity</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-slate-900">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  {INTENSITY_MULTIPLIERS[intensity].label}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-orange-600">Calories</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-orange-600">
                  <Flame className="h-4 w-4" />
                  {estimatedCalories}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <Button
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
          disabled={!selectedExercise || !isValidDuration || isSaving}
          onClick={handleSave}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Dumbbell className="mr-2 h-4 w-4" />
              Save Workout {estimatedCalories > 0 ? `· ${estimatedCalories} cal burned` : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
