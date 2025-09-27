import { FoodItem, FoodLog } from '@/types'

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Format date for API calls (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Get date range for weekly summary
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // End of week (Saturday)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

// Get date range for monthly summary
export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return { start, end }
}

// Calculate total nutrition for a day
export function calculateDayTotals(foodLogs: FoodLog[]): {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
} {
  return foodLogs.reduce(
    (totals, log) => {
      const foods = log.analysis?.foods || []
      const dayTotal = foods.reduce((dayTotals, food) => ({
        calories: dayTotals.calories + (food.total_calories || 0),
        protein: dayTotals.protein + (food.protein || 0),
        carbohydrates: dayTotals.carbohydrates + (food.carbohydrates || 0),
        fat: dayTotals.fat + (food.fat || 0),
        fiber: dayTotals.fiber + (food.fiber || 0),
        sugar: dayTotals.sugar + (food.sugar || 0),
        sodium: dayTotals.sodium + (food.sodium || 0)
      }), {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      })
      
      return {
        calories: totals.calories + dayTotal.calories,
        protein: totals.protein + dayTotal.protein,
        carbohydrates: totals.carbohydrates + dayTotal.carbohydrates,
        fat: totals.fat + dayTotal.fat,
        fiber: totals.fiber + dayTotal.fiber,
        sugar: totals.sugar + dayTotal.sugar,
        sodium: totals.sodium + dayTotal.sodium
      }
    },
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    }
  )
}

// Group food logs by date
export function groupLogsByDate(logs: FoodLog[]): Record<string, FoodLog[]> {
  return logs.reduce((groups: Record<string, FoodLog[]>, log) => {
    const date = formatDateForAPI(new Date(log.timestamp))
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(log)
    return groups
  }, {})
}

// Calculate weekly averages
export function calculateWeeklyAverages(logs: FoodLog[]): {
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
  daysLogged: number
} {
  const groupedLogs = groupLogsByDate(logs)
  const dates = Object.keys(groupedLogs)
  
  if (dates.length === 0) {
    return {
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      daysLogged: 0
    }
  }
  
  const dailyTotals = dates.map(date => calculateDayTotals(groupedLogs[date]))
  
  return {
    avgCalories: Math.round(dailyTotals.reduce((sum, day) => sum + day.calories, 0) / dates.length),
    avgProtein: Math.round(dailyTotals.reduce((sum, day) => sum + day.protein, 0) / dates.length),
    avgCarbs: Math.round(dailyTotals.reduce((sum, day) => sum + day.carbohydrates, 0) / dates.length),
    avgFat: Math.round(dailyTotals.reduce((sum, day) => sum + day.fat, 0) / dates.length),
    daysLogged: dates.length
  }
}

// Generate meal time suggestions
export function getMealTimeSuggestion(): string {
  const hour = new Date().getHours()
  
  if (hour < 10) return 'Breakfast'
  if (hour < 14) return 'Lunch'
  if (hour < 17) return 'Snack'
  if (hour < 21) return 'Dinner'
  return 'Evening Snack'
}

// Validate food item data
export function validateFoodItem(item: any): item is FoodItem {
  return (
    item &&
    typeof item.food_name === 'string' &&
    typeof item.estimated_weight_grams === 'number' &&
    typeof item.calories_per_100g === 'number' &&
    typeof item.total_calories === 'number' &&
    typeof item.protein === 'number' &&
    typeof item.carbohydrates === 'number' &&
    typeof item.fat === 'number'
  )
}

// Clean up food name for display
export function formatFoodName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Calculate confidence color for UI
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600'
  if (confidence >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

// Calculate confidence text
export function getConfidenceText(confidence: number): string {
  if (confidence >= 0.8) return 'High'
  if (confidence >= 0.6) return 'Medium'
  return 'Low'
}
