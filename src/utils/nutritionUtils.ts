export interface NutritionGoals {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
}

export interface UserProfile {
  age: number
  gender: 'male' | 'female'
  height: number // cm
  weight: number // kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  goal: 'lose' | 'maintain' | 'gain'
}

// Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
export function calculateBMR(profile: UserProfile): number {
  const { age, gender, height, weight } = profile
  
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// Calculate Total Daily Energy Expenditure
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile)
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  }
  
  return bmr * activityMultipliers[profile.activityLevel]
}

// Calculate daily nutrition goals
export function calculateNutritionGoals(profile: UserProfile): NutritionGoals {
  let tdee = calculateTDEE(profile)
  
  // Adjust for goal
  switch (profile.goal) {
    case 'lose':
      tdee *= 0.85 // 15% deficit
      break
    case 'gain':
      tdee *= 1.15 // 15% surplus
      break
    case 'maintain':
    default:
      // No adjustment needed
      break
  }
  
  const calories = Math.round(tdee)
  
  // Macronutrient distribution (moderate approach)
  const proteinCalories = calories * 0.25 // 25% protein
  const fatCalories = calories * 0.30 // 30% fat
  const carbCalories = calories * 0.45 // 45% carbs
  
  return {
    calories,
    protein: Math.round(proteinCalories / 4), // 4 calories per gram
    carbohydrates: Math.round(carbCalories / 4), // 4 calories per gram
    fat: Math.round(fatCalories / 9), // 9 calories per gram
    fiber: Math.round(calories / 100) // 1g fiber per 100 calories (rough guideline)
  }
}

// Calculate nutrition percentages for progress tracking
export function calculateNutritionProgress(consumed: {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
}, goals: NutritionGoals) {
  return {
    calories: Math.min((consumed.calories / goals.calories) * 100, 100),
    protein: Math.min((consumed.protein / goals.protein) * 100, 100),
    carbohydrates: Math.min((consumed.carbohydrates / goals.carbohydrates) * 100, 100),
    fat: Math.min((consumed.fat / goals.fat) * 100, 100),
    fiber: Math.min((consumed.fiber / goals.fiber) * 100, 100)
  }
}

// Format nutrition values for display
export function formatNutritionValue(value: number, unit: string = 'g'): string {
  return `${Math.round(value)}${unit}`
}

// Get nutrition advice based on current intake
export function getNutritionAdvice(consumed: {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
}, goals: NutritionGoals): string[] {
  const advice: string[] = []
  const progress = calculateNutritionProgress(consumed, goals)
  
  if (progress.protein < 80) {
    advice.push("💪 Consider adding more protein-rich foods like chicken, fish, eggs, or legumes")
  }
  
  if (progress.fiber < 60) {
    advice.push("🌿 Include more fiber with vegetables, fruits, and whole grains for better digestion")
  }
  
  if (consumed.calories < goals.calories * 0.7) {
    advice.push("🍽️ You might need to eat more to meet your daily energy needs")
  }
  
  if (consumed.calories > goals.calories * 1.2) {
    advice.push("⚖️ Consider smaller portions or lighter options for the rest of the day")
  }
  
  if (progress.fat > 90 && progress.carbohydrates < 50) {
    advice.push("🍞 Balance your macros with some healthy carbohydrates like oats or sweet potatoes")
  }
  
  return advice
}
