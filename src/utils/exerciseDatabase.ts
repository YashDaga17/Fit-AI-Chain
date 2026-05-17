/**
 * Exercise Knowledge Base
 *
 * Contains common exercises with base calorie burn rates (calories/min)
 * and intensity multipliers for accurate calorie calculation.
 */

export interface ExerciseDefinition {
  name: string
  caloriesPerMin: number
  category: 'cardio' | 'strength' | 'flexibility' | 'sports'
  icon: string
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // Cardio
  { name: 'Running', caloriesPerMin: 10, category: 'cardio', icon: '🏃' },
  { name: 'Walking', caloriesPerMin: 4, category: 'cardio', icon: '🚶' },
  { name: 'Cycling', caloriesPerMin: 8, category: 'cardio', icon: '🚴' },
  { name: 'Swimming', caloriesPerMin: 11, category: 'cardio', icon: '🏊' },
  { name: 'Jump Rope', caloriesPerMin: 12, category: 'cardio', icon: '⏫' },
  { name: 'Rowing', caloriesPerMin: 9, category: 'cardio', icon: '🚣' },
  { name: 'Stair Climbing', caloriesPerMin: 9, category: 'cardio', icon: '🪜' },
  { name: 'Elliptical', caloriesPerMin: 7, category: 'cardio', icon: '🏋️' },
  { name: 'Dancing', caloriesPerMin: 6, category: 'cardio', icon: '💃' },
  { name: 'Hiking', caloriesPerMin: 7, category: 'cardio', icon: '🥾' },

  // Strength
  { name: 'Weight Training', caloriesPerMin: 6, category: 'strength', icon: '🏋️' },
  { name: 'Push-ups', caloriesPerMin: 7, category: 'strength', icon: '💪' },
  { name: 'Pull-ups', caloriesPerMin: 8, category: 'strength', icon: '🤸' },
  { name: 'Squats', caloriesPerMin: 6, category: 'strength', icon: '🦵' },
  { name: 'Deadlifts', caloriesPerMin: 7, category: 'strength', icon: '🏋️' },
  { name: 'Plank', caloriesPerMin: 4, category: 'strength', icon: '🧘' },
  { name: 'Kettlebell', caloriesPerMin: 9, category: 'strength', icon: '🔔' },
  { name: 'Resistance Bands', caloriesPerMin: 5, category: 'strength', icon: '🎗️' },

  // Flexibility
  { name: 'Yoga', caloriesPerMin: 3, category: 'flexibility', icon: '🧘' },
  { name: 'Pilates', caloriesPerMin: 4, category: 'flexibility', icon: '🤸' },
  { name: 'Stretching', caloriesPerMin: 2, category: 'flexibility', icon: '🙆' },
  { name: 'Tai Chi', caloriesPerMin: 3, category: 'flexibility', icon: '🥋' },

  // Sports
  { name: 'Basketball', caloriesPerMin: 8, category: 'sports', icon: '🏀' },
  { name: 'Football', caloriesPerMin: 9, category: 'sports', icon: '⚽' },
  { name: 'Tennis', caloriesPerMin: 7, category: 'sports', icon: '🎾' },
  { name: 'Badminton', caloriesPerMin: 6, category: 'sports', icon: '🏸' },
  { name: 'Cricket', caloriesPerMin: 5, category: 'sports', icon: '🏏' },
  { name: 'Boxing', caloriesPerMin: 10, category: 'sports', icon: '🥊' },
  { name: 'Martial Arts', caloriesPerMin: 9, category: 'sports', icon: '🥋' },
  { name: 'Table Tennis', caloriesPerMin: 4, category: 'sports', icon: '🏓' },
]

export type IntensityLevel = 'low' | 'medium' | 'high'

export const INTENSITY_MULTIPLIERS: Record<IntensityLevel, { label: string; multiplier: number; description: string }> = {
  low: { label: 'Low', multiplier: 0.8, description: 'Light effort, can talk easily' },
  medium: { label: 'Medium', multiplier: 1.0, description: 'Moderate effort, slightly breathless' },
  high: { label: 'High', multiplier: 1.2, description: 'Intense effort, hard to talk' },
}

/**
 * Calculate calories burned for a given exercise session.
 *
 * Formula: Duration (min) × Calories per Minute × Intensity Multiplier
 */
export function calculateCaloriesBurned(
  durationMinutes: number,
  caloriesPerMin: number,
  intensity: IntensityLevel
): number {
  const multiplier = INTENSITY_MULTIPLIERS[intensity].multiplier
  return Math.round(durationMinutes * caloriesPerMin * multiplier)
}

/**
 * Find an exercise definition by name (case-insensitive).
 */
export function findExercise(name: string): ExerciseDefinition | undefined {
  return EXERCISE_DATABASE.find(
    (exercise) => exercise.name.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Get exercises grouped by category.
 */
export function getExercisesByCategory(): Record<string, ExerciseDefinition[]> {
  return EXERCISE_DATABASE.reduce(
    (groups, exercise) => {
      const category = exercise.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(exercise)
      return groups
    },
    {} as Record<string, ExerciseDefinition[]>
  )
}
