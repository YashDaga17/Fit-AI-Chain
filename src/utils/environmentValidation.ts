/**
 * Environment variable validation utility
 * Run this on app startup to catch configuration issues early
 */

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Critical variables - check both possible naming conventions
  const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || process.env.NEXT_PUBLIC_WLD_APP_ID
  if (!appId) {
    errors.push('NEXT_PUBLIC_WORLDCOIN_APP_ID or NEXT_PUBLIC_WLD_APP_ID is required')
  } else if (!appId.startsWith('app_')) {
    errors.push('World App ID must start with "app_"')
  }

  // Backend app ID should match frontend - but only check on server side
  if (typeof window === 'undefined') {
    // Server-side validation
    const backendAppId = process.env.APP_ID || process.env.WLD_CLIENT_ID
    if (!backendAppId && process.env.NODE_ENV === 'production') {
      warnings.push('No backend app ID configured - World ID verification may not work')
    }
  }

  // Action is required for World ID
  const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || process.env.NEXT_PUBLIC_WLD_ACTION
  if (!action) {
    warnings.push('NEXT_PUBLIC_WORLDCOIN_ACTION not set - using default "verify"')
  }

  // HTTPS check for production - only in browser
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    if (window.location.protocol !== 'https:') {
      errors.push('HTTPS is required for World ID verification in production')
    }
  }

  // Google API Key check - only on server side
  if (typeof window === 'undefined') {
    const googleApiKey = process.env.GOOGLE_API_KEY
    if (!googleApiKey) {
      warnings.push('GOOGLE_API_KEY not configured - AI food analysis will not work')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function logEnvironmentStatus() {
  const validation = validateEnvironmentVariables()
  const isServer = typeof window === 'undefined'
  
  console.group(`🔧 Environment Configuration (${isServer ? 'Server' : 'Client'})`)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('App ID configured:', !!process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID)
  console.log('Action:', process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || 'verify (default)')
  console.log('Signal:', process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL || '(empty)')
  
  if (validation.errors.length > 0) {
    console.group('❌ Errors')
    validation.errors.forEach(error => console.error(error))
    console.groupEnd()
  }
  
  if (validation.warnings.length > 0) {
    console.group('⚠️ Warnings')
    validation.warnings.forEach(warning => console.warn(warning))
    console.groupEnd()
  }
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed')
  } else {
    console.error('❌ Environment validation failed')
  }
  
  console.groupEnd()
  
  return validation
}
