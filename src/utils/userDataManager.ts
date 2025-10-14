/**
 * User data management utilities for new user onboarding and data persistence
 */

export interface UserStats {
  totalCalories: number
  totalXP: number
  streak: number
  level: number
  rank: number
  totalEntries?: number
  joinedAt?: number
  lastVisit?: number
}

export interface UserPreferences {
  notifications: boolean
  autoSync: boolean
  theme: 'light' | 'dark'
  units: 'metric' | 'imperial'
  createdAt: number
}

export interface VerificationData {
  verified: boolean
  timestamp: number
  action: string
  nullifierHash?: string
  verificationType: 'worldid' | 'guest' | 'wallet'
  expiresAt?: number
  isGuest?: boolean
  // Wallet-specific fields
  address?: string
  signature?: string
  message?: string
  username?: string
}

/**
 * Initialize default user data for new users
 */
export function initializeNewUserData(): {
  stats: UserStats
  preferences: UserPreferences
  entries: any[]
} {
  const defaultStats: UserStats = {
    totalCalories: 0,
    totalXP: 0,
    streak: 1,
    level: 1,
    rank: 1,
    totalEntries: 0,
    joinedAt: Date.now(),
    lastVisit: Date.now()
  }

  const defaultPreferences: UserPreferences = {
    notifications: true,
    autoSync: true,
    theme: 'light',
    units: 'metric',
    createdAt: Date.now()
  }

  const defaultEntries: any[] = []

  return {
    stats: defaultStats,
    preferences: defaultPreferences,
    entries: defaultEntries
  }
}

/**
 * Safely load user data from localStorage with validation
 */
export function loadUserDataSafely(): {
  stats: UserStats | null
  preferences: UserPreferences | null
  entries: any[]
  verification: VerificationData | null
} {
  try {
    const stats = localStorage.getItem('user_stats')
    const preferences = localStorage.getItem('user_preferences')
    const entries = localStorage.getItem('food_entries')
    const verification = localStorage.getItem('worldid_verification')

    return {
      stats: stats ? validateAndParseStats(JSON.parse(stats)) : null,
      preferences: preferences ? validateAndParsePreferences(JSON.parse(preferences)) : null,
      entries: entries ? (Array.isArray(JSON.parse(entries)) ? JSON.parse(entries) : []) : [],
      verification: verification ? validateAndParseVerification(JSON.parse(verification)) : null
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    return {
      stats: null,
      preferences: null,
      entries: [],
      verification: null
    }
  }
}

/**
 * Validate and sanitize user stats data
 */
function validateAndParseStats(data: any): UserStats | null {
  if (!data || typeof data !== 'object') return null

  try {
    return {
      totalCalories: Number(data.totalCalories) || 0,
      totalXP: Number(data.totalXP) || 0,
      streak: Number(data.streak) || 1,
      level: Number(data.level) || 1,
      rank: Number(data.rank) || 1,
      totalEntries: Number(data.totalEntries) || 0,
      joinedAt: data.joinedAt || Date.now(),
      lastVisit: Date.now()
    }
  } catch {
    return null
  }
}

/**
 * Validate and sanitize user preferences data
 */
function validateAndParsePreferences(data: any): UserPreferences | null {
  if (!data || typeof data !== 'object') return null

  try {
    return {
      notifications: typeof data.notifications === 'boolean' ? data.notifications : true,
      autoSync: typeof data.autoSync === 'boolean' ? data.autoSync : true,
      theme: data.theme === 'dark' ? 'dark' : 'light',
      units: data.units === 'imperial' ? 'imperial' : 'metric',
      createdAt: data.createdAt || Date.now()
    }
  } catch {
    return null
  }
}

/**
 * Validate and sanitize verification data
 */
function validateAndParseVerification(data: any): VerificationData | null {
  if (!data || typeof data !== 'object') return null

  try {
    // Check if verification is expired
    const now = Date.now()
    if (data.expiresAt && now > data.expiresAt) {
      return null
    }

    return {
      verified: Boolean(data.verified),
      timestamp: data.timestamp || Date.now(),
      action: data.action || 'unknown',
      nullifierHash: data.nullifierHash,
      verificationType: data.verificationType || 'worldid',
      expiresAt: data.expiresAt,
      isGuest: Boolean(data.isGuest),
      // Wallet-specific fields
      address: data.address,
      signature: data.signature,
      message: data.message,
      username: data.username
    }
  } catch {
    return null
  }
}

/**
 * Save user data to localStorage safely
 */
export function saveUserDataSafely(data: {
  stats?: UserStats
  preferences?: UserPreferences
  entries?: any[]
  verification?: VerificationData
}) {
  try {
    if (data.stats) {
      localStorage.setItem('user_stats', JSON.stringify(data.stats))
    }
    if (data.preferences) {
      localStorage.setItem('user_preferences', JSON.stringify(data.preferences))
    }
    if (data.entries) {
      localStorage.setItem('food_entries', JSON.stringify(data.entries))
    }
    if (data.verification) {
      localStorage.setItem('worldid_verification', JSON.stringify(data.verification))
    }
    return true
  } catch (error) {
    console.error('Error saving user data:', error)
    return false
  }
}

/**
 * Create guest verification for non-World App users
 */
export function createGuestVerification(): VerificationData {
  return {
    verified: true,
    timestamp: Date.now(),
    action: 'guest-access',
    verificationType: 'guest',
    nullifierHash: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    isGuest: true
  }
}

/**
 * Check if user needs onboarding (new user with no data)
 */
export function needsOnboarding(): boolean {
  const userData = loadUserDataSafely()
  return !userData.verification && !userData.stats && userData.entries.length === 0
}

/**
 * Clear all user data (for testing or account reset)
 */
export function clearAllUserData() {
  try {
    localStorage.removeItem('worldid_verification')
    localStorage.removeItem('user_stats')
    localStorage.removeItem('food_entries')
    localStorage.removeItem('user_preferences')
    return true
  } catch (error) {
    console.error('Error clearing user data:', error)
    return false
  }
}

/**
 * Migrate guest data to verified account
 */
export function migrateGuestToVerified(newVerification: VerificationData): boolean {
  try {
    const userData = loadUserDataSafely()
    
    if (userData.verification?.isGuest) {
      // Update verification to full World ID
      const updatedVerification = {
        ...newVerification,
        isGuest: false
      }
      
      // Keep existing user data but update verification
      saveUserDataSafely({
        verification: updatedVerification
      })
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error migrating guest account:', error)
    return false
  }
}
