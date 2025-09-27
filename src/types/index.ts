// Food analysis types
export interface FoodItem {
  food_name: string
  estimated_weight_grams: number
  calories_per_100g: number
  total_calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  confidence: number
  serving_size: string
  data_source: string
  analysis_notes: string
}

export interface FoodAnalysis {
  foods: FoodItem[]
  total_calories: number
  analysis_confidence: number
  general_notes: string
}

export interface FoodLog {
  id: string
  timestamp: string
  image: string
  analysis: FoodAnalysis
}

// User preferences
export interface UserPreferences {
  dailyCalorieGoal: number
  proteinGoal: number
  carbGoal: number
  fatGoal: number
  notifications: boolean
  userName: string
}

// Common food item for quick add
export interface CommonFood {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving: string
}

// World ID types
export interface WorldIDProof {
  proof: string
  merkle_root: string
  nullifier_hash: string
  verification_level: string
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

export interface GeminiAnalysisResponse {
  success: boolean
  analysis: FoodAnalysis
  timestamp: string
}
