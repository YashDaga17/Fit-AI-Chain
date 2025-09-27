export interface NutritionTip {
  id: string
  category: 'protein' | 'fiber' | 'hydration' | 'timing' | 'general'
  title: string
  content: string
  icon: string
}

export const nutritionTips: NutritionTip[] = [
  {
    id: 'protein-timing',
    category: 'protein',
    title: 'Spread Protein Throughout the Day',
    content: 'Aim for 20-30g of protein per meal to optimize muscle protein synthesis and keep you feeling full.',
    icon: '💪'
  },
  {
    id: 'fiber-benefits',
    category: 'fiber',
    title: 'Fiber for Fullness',
    content: 'High-fiber foods help you feel satisfied longer and support digestive health. Aim for 25-35g daily.',
    icon: '🌿'
  },
  {
    id: 'hydration-tip',
    category: 'hydration',
    title: 'Stay Hydrated',
    content: 'Sometimes thirst masquerades as hunger. Drink a glass of water before snacking.',
    icon: '💧'
  },
  {
    id: 'meal-timing',
    category: 'timing',
    title: 'Consistent Meal Times',
    content: 'Eating at regular intervals helps regulate your metabolism and prevents extreme hunger.',
    icon: '⏰'
  },
  {
    id: 'photo-tips',
    category: 'general',
    title: 'Better Food Photos',
    content: 'Take photos in good lighting and include reference objects (like a coin) for more accurate analysis.',
    icon: '📸'
  },
  {
    id: 'portion-control',
    category: 'general',
    title: 'Visual Portion Guide',
    content: 'Use your hand as a guide: palm = protein, fist = vegetables, cupped hand = carbs, thumb = fats.',
    icon: '✋'
  },
  {
    id: 'balanced-plate',
    category: 'general',
    title: 'The Perfect Plate',
    content: 'Fill half your plate with vegetables, one quarter with lean protein, and one quarter with whole grains.',
    icon: '🍽️'
  },
  {
    id: 'mindful-eating',
    category: 'timing',
    title: 'Eat Mindfully',
    content: 'Slow down and chew thoroughly. It takes 20 minutes for your brain to register fullness.',
    icon: '🧠'
  },
  {
    id: 'snack-smart',
    category: 'general',
    title: 'Smart Snacking',
    content: 'Combine protein with fiber for satisfying snacks: apple with almond butter, Greek yogurt with berries.',
    icon: '🥜'
  },
  {
    id: 'prep-ahead',
    category: 'general',
    title: 'Meal Prep Success',
    content: 'Prepare healthy options in advance. When you\'re hungry, you\'ll reach for what\'s convenient.',
    icon: '📦'
  }
]

// Get a random tip
export function getRandomTip(): NutritionTip {
  return nutritionTips[Math.floor(Math.random() * nutritionTips.length)]
}

// Get tips by category
export function getTipsByCategory(category: NutritionTip['category']): NutritionTip[] {
  return nutritionTips.filter(tip => tip.category === category)
}

// Get daily tip (consistent for the day)
export function getDailyTip(): NutritionTip {
  const today = new Date().toDateString()
  const hash = today.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  const index = Math.abs(hash) % nutritionTips.length
  return nutritionTips[index]
}

export interface HealthInsight {
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  action?: string
}

// Generate personalized insights based on eating patterns
export function generateInsights(weeklyData: {
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
  daysLogged: number
}, goals: { calories: number, protein: number }): HealthInsight[] {
  const insights: HealthInsight[] = []
  
  // Consistency insight
  if (weeklyData.daysLogged >= 5) {
    insights.push({
      type: 'success',
      title: 'Great Consistency! 🎯',
      message: `You've logged ${weeklyData.daysLogged} days this week. Consistency is key to reaching your goals.`
    })
  } else if (weeklyData.daysLogged >= 3) {
    insights.push({
      type: 'info',
      title: 'Keep It Up! 📱',
      message: `You've logged ${weeklyData.daysLogged} days. Try to log daily for better insights.`,
      action: 'Set a daily reminder'
    })
  }
  
  // Protein insight
  const proteinPercentage = (weeklyData.avgProtein / goals.protein) * 100
  if (proteinPercentage < 70) {
    insights.push({
      type: 'warning',
      title: 'Protein Opportunity 💪',
      message: `You're averaging ${weeklyData.avgProtein}g protein. Consider adding protein-rich foods.`,
      action: 'Try Greek yogurt or lean meats'
    })
  } else if (proteinPercentage >= 90) {
    insights.push({
      type: 'success',
      title: 'Protein Champion! 🥇',
      message: `Excellent protein intake averaging ${weeklyData.avgProtein}g. Your muscles thank you!`
    })
  }
  
  // Calorie balance insight
  const calorieVariance = Math.abs(weeklyData.avgCalories - goals.calories) / goals.calories * 100
  if (calorieVariance < 10) {
    insights.push({
      type: 'success',
      title: 'Perfect Balance! ⚖️',
      message: `Your calorie intake is well-balanced, averaging ${weeklyData.avgCalories} calories.`
    })
  } else if (weeklyData.avgCalories < goals.calories * 0.8) {
    insights.push({
      type: 'warning',
      title: 'Energy Check 🔋',
      message: `You're averaging ${weeklyData.avgCalories} calories. Make sure you're eating enough.`,
      action: 'Add healthy snacks'
    })
  }
  
  return insights
}

// Motivational messages based on time of day
export function getMotivationalMessage(): string {
  const hour = new Date().getHours()
  const messages = {
    morning: [
      "Start your day with intention! 🌅",
      "Fuel your body for success today! ⚡",
      "Every healthy choice counts! 💪",
      "You're in control of your nutrition! 🎯"
    ],
    afternoon: [
      "Stay strong - you're doing great! 💪",
      "Healthy choices add up! ⭐",
      "Keep your energy steady! 🔋",
      "Progress over perfection! 📈"
    ],
    evening: [
      "Reflect on today's wins! 🏆",
      "Tomorrow is a fresh start! 🌟",
      "Consistency builds success! 🎯",
      "Rest well, you've earned it! 😴"
    ]
  }
  
  let timeOfDay: keyof typeof messages
  if (hour < 12) timeOfDay = 'morning'
  else if (hour < 18) timeOfDay = 'afternoon'
  else timeOfDay = 'evening'
  
  const timeMessages = messages[timeOfDay]
  return timeMessages[Math.floor(Math.random() * timeMessages.length)]
}
