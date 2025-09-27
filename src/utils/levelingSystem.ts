// Food tracking and calorie counting level system

export interface UserLevel {
  level: number
  title: string
  description: string
  minXP: number
  maxXP: number
  badge: string
}

export const FOOD_TRACKING_LEVELS: UserLevel[] = [
  {
    level: 1,
    title: "Calorie Curious",
    description: "Just starting your food tracking journey",
    minXP: 0,
    maxXP: 499,
    badge: "🌱"
  },
  {
    level: 2,
    title: "Portion Pioneer",
    description: "Learning about portion sizes and nutrition",
    minXP: 500,
    maxXP: 1199,
    badge: "🥄"
  },
  {
    level: 3,
    title: "Macro Mapper",
    description: "Understanding macronutrients and balanced eating",
    minXP: 1200,
    maxXP: 2499,
    badge: "🍎"
  },
  {
    level: 4,
    title: "Nutrition Navigator",
    description: "Skilled at making healthy food choices",
    minXP: 2500,
    maxXP: 4999,
    badge: "🧭"
  },
  {
    level: 5,
    title: "Calorie Calculator",
    description: "Expert at estimating food calories accurately",
    minXP: 5000,
    maxXP: 9999,
    badge: "🧮"
  },
  {
    level: 6,
    title: "Diet Detective",
    description: "Master of identifying hidden calories and ingredients",
    minXP: 10000,
    maxXP: 19999,
    badge: "🔍"
  },
  {
    level: 7,
    title: "Wellness Warrior",
    description: "Champion of healthy eating and lifestyle",
    minXP: 20000,
    maxXP: 39999,
    badge: "⚔️"
  },
  {
    level: 8,
    title: "Nutrition Ninja",
    description: "Stealthy expert at maintaining perfect nutrition",
    minXP: 40000,
    maxXP: 79999,
    badge: "🥷"
  },
  {
    level: 9,
    title: "Food Sage",
    description: "Wise master of all things nutrition and wellness",
    minXP: 80000,
    maxXP: 159999,
    badge: "🧙‍♀️"
  },
  {
    level: 10,
    title: "Calorie Conqueror",
    description: "Legendary food tracking champion",
    minXP: 160000,
    maxXP: Infinity,
    badge: "👑"
  }
]

export function getUserLevel(totalXP: number): UserLevel {
  // Ensure totalXP is a valid number
  const validXP = Number(totalXP) || 0
  
  for (const level of FOOD_TRACKING_LEVELS) {
    if (validXP >= level.minXP && validXP <= level.maxXP) {
      return level
    }
  }
  // Default to highest level if XP exceeds all levels
  return FOOD_TRACKING_LEVELS[FOOD_TRACKING_LEVELS.length - 1]
}

export function getNextLevel(currentLevel: number): UserLevel | null {
  if (currentLevel >= FOOD_TRACKING_LEVELS.length) {
    return null // Already at max level
  }
  return FOOD_TRACKING_LEVELS[currentLevel] // Next level (0-indexed)
}

export function getXPProgress(totalXP: number): {
  currentLevel: UserLevel
  nextLevel: UserLevel | null
  progressXP: number
  neededXP: number
  progressPercentage: number
} {
  const currentLevel = getUserLevel(totalXP)
  const nextLevel = getNextLevel(currentLevel.level)
  
  const progressXP = totalXP - currentLevel.minXP
  const levelXPRange = currentLevel.maxXP - currentLevel.minXP
  const neededXP = nextLevel ? nextLevel.minXP - totalXP : 0
  const progressPercentage = (progressXP / levelXPRange) * 100
  
  return {
    currentLevel,
    nextLevel,
    progressXP,
    neededXP,
    progressPercentage: Math.min(progressPercentage, 100)
  }
}

export function calculateStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0  // 1 month streak: 2x XP
  if (streak >= 14) return 1.7  // 2 week streak: 1.7x XP
  if (streak >= 7) return 1.5   // 1 week streak: 1.5x XP
  if (streak >= 3) return 1.2   // 3 day streak: 1.2x XP
  return 1.0 // No bonus
}

export function getAchievements(totalXP: number, streak: number, totalEntries: number): string[] {
  const achievements: string[] = []
  
  // XP-based achievements
  if (totalXP >= 1000) achievements.push("🏆 First Thousand")
  if (totalXP >= 10000) achievements.push("💎 XP Diamond")
  if (totalXP >= 50000) achievements.push("⭐ XP Superstar")
  
  // Streak-based achievements
  if (streak >= 7) achievements.push("🔥 Week Warrior")
  if (streak >= 30) achievements.push("📅 Month Master")
  if (streak >= 100) achievements.push("💪 Century Champion")
  
  // Entry-based achievements
  if (totalEntries >= 50) achievements.push("📸 Snap Master")
  if (totalEntries >= 200) achievements.push("🎯 Tracking Pro")
  if (totalEntries >= 1000) achievements.push("🚀 Calorie Legend")
  
  return achievements
}

// Food category bonuses
export function getCategoryBonus(foodName: string): number {
  const lowerFood = foodName.toLowerCase()
  
  if (lowerFood.includes('salad') || lowerFood.includes('vegetable') || lowerFood.includes('fruit')) {
    return 1.2 // 20% bonus for healthy foods
  }
  if (lowerFood.includes('grilled') || lowerFood.includes('steamed') || lowerFood.includes('baked')) {
    return 1.1 // 10% bonus for healthy cooking methods
  }
  
  return 1.0 // No bonus
}
