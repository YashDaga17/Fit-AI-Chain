'use client'

import { MiniKit } from '@worldcoin/minikit-js'

export function initMiniKit() {
  if (typeof window !== 'undefined') {
    try {
      // Only install if MiniKit is not already installed
      if (!MiniKit.isInstalled()) {
        const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || 'app_86f9f548ff3e656a673692a02440cddf'
        console.log('Installing MiniKit with app_id:', appId)
        MiniKit.install(appId)
      } else {
        console.log('MiniKit is already installed')
      }
    } catch (error) {
      console.error('Error initializing MiniKit:', error)
    }
  }
}

// Helper to safely check if MiniKit is available
export function isMiniKitAvailable(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    return MiniKit.isInstalled()
  } catch (error) {
    console.error('Error checking MiniKit availability:', error)
    return false
  }
}

export { MiniKit }
