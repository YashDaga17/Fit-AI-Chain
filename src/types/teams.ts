// Enhanced types for the team staking feature
export interface User {
  id: number
  username: string
  wallet_address?: string
  nullifier_hash?: string
  verification_type: 'worldid' | 'guest' | 'wallet'
  total_calories: number
  total_xp: number
  streak: number
  level: number
  rank: number
  total_entries: number
  created_at: string
  updated_at: string
}

export interface Group {
  id: number
  name: string
  description?: string
  creator_id: number
  is_private: boolean
  max_members: number
  created_at: string
  updated_at: string
  member_count?: number
  members?: GroupMember[]
}

export interface GroupMember {
  id: number
  group_id: number
  user_id: number
  username: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface Stake {
  id: number
  group_id: number
  creator_id: number
  competition_type: 'daily' | 'meal'
  meal_type?: 'breakfast' | 'lunch' | 'dinner'
  stake_amount: number
  total_pool: number
  start_time: string
  end_time: string
  status: 'active' | 'completed' | 'cancelled'
  winner_id?: number
  created_at: string
  participants?: StakeParticipant[]
  group_name?: string
  creator_username?: string
  winner_username?: string
}

export interface StakeParticipant {
  id: number
  stake_id: number
  user_id: number
  username: string
  amount: number
  calories_tracked: number
  images_submitted: number
  is_qualified: boolean
  joined_at: string
}

export interface MealWindow {
  id: number
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  start_hour: number
  start_minute: number
  end_hour: number
  end_minute: number
  min_images: number
  is_active: boolean
}

export interface EnhancedFoodEntry {
  id: number
  user_id: number
  group_id?: number
  stake_id?: number
  food_name: string
  calories: number
  xp_earned: number
  confidence?: string
  cuisine?: string
  portion_size?: string
  ingredients?: string[]
  cooking_method?: string
  nutrients?: {
    protein: string
    carbs: string
    fat: string
    fiber: string
    sugar?: string
    [key: string]: any
  }
  health_score?: number
  allergens?: string[]
  alternatives?: string
  image_url: string
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  meal_window_start?: string
  meal_window_end?: string
  created_at: string
  username?: string
}

export interface UserStatsHistory {
  id: number
  user_id: number
  date: string
  calories: number
  xp_earned: number
  entries_count: number
  streak: number
  created_at: string
}

// Request/Response types for API endpoints
export interface CreateGroupRequest {
  name: string
  description?: string
  is_private?: boolean
  max_members?: number
}

export interface JoinGroupRequest {
  group_id: number
  user_id: number
}

export interface CreateStakeRequest {
  group_id: number
  competition_type: 'daily' | 'meal'
  meal_type?: 'breakfast' | 'lunch' | 'dinner'
  stake_amount: number
  start_time: string
  end_time?: string // Optional, will be calculated based on competition_type
}

export interface JoinStakeRequest {
  stake_id: number
  user_id: number
  amount: number
}

export interface SearchUsersRequest {
  query: string
  limit?: number
}

export interface GroupLeaderboardEntry {
  user_id: number
  username: string
  calories: number
  images_count: number
  xp_earned: number
  rank: number
  is_qualified: boolean
}

export interface MealTrackingStatus {
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  is_active: boolean
  window_start: string
  window_end: string
  min_images: number
  current_images: number
  can_submit: boolean
  time_remaining?: number
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface UserSearchResult {
  id: number
  username: string
  level: number
  total_xp: number
  verification_type: string
}

export interface GroupStats {
  total_members: number
  total_calories_today: number
  active_stakes: number
  completed_stakes: number
}

export interface StakeStats {
  total_participants: number
  total_pool: number
  leader_calories: number
  leader_username: string
  time_remaining: number
  qualified_participants: number
}

// Update existing interfaces to maintain compatibility
export interface FoodEntry extends EnhancedFoodEntry {}

// Re-export existing types for compatibility
export type { FoodItem, FoodAnalysis, FoodLog, UserPreferences, CommonFood, WorldIDProof, GeminiAnalysisResponse } from './index'
