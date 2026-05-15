export type UserPreferences = {
  dailyCalorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
  fiberGoal: number
  theme?: string
  notifications?: boolean
  units?: string
  language?: string
}

export type DailyAnalyticsPoint = {
  date: string
  calories: number
  xp: number
  entries: number
}

export type WeeklyAnalytics = {
  todayCalories: number
  weeklyCalories: number
  averageDailyCalories: number
  weeklyXP: number
  daysLogged: number
  currentStreak: number
  averageProtein: number
  averageCarbs: number
  averageFat: number
  averageFiber: number
  dailyBreakdown: DailyAnalyticsPoint[]
  topMealType: string
}
