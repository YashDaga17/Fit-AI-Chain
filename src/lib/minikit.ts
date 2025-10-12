'use client'

import { MiniKit } from '@worldcoin/minikit-js'

export function initMiniKit() {
  if (typeof window !== 'undefined') {
    try {
      if (!MiniKit.isInstalled()) {
        const appId = process.env.NEXT_PUBLIC_WLD_APP_ID
        MiniKit.install(appId)
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
    return false
  }
}

export { MiniKit }
