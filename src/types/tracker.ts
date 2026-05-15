export type Nutrients = {
  protein: string
  carbs: string
  fat: string
  fiber: string
  sugar?: string
}

export type FoodEntry = {
  id: string
  image: string
  food: string
  calories: number
  timestamp: number
  xp: number
  confidence?: string
  cuisine?: string
  portionSize?: string
  ingredients?: string[]
  cookingMethod?: string
  nutrients?: Nutrients
  healthScore?: string
  allergens?: string[]
  alternatives?: string
  mealType?: string
}

export type FoodEntryFormValues = {
  food: string
  calories: string
  mealType: string
  portionSize: string
  cuisine: string
  protein: string
  carbs: string
  fat: string
  fiber: string
}
