'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitInitializer() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Initialize MiniKit only on client side and only once
    if (typeof window === 'undefined' || initialized) return

    const initializeMiniKit = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_WLD_APP_ID
        
        // Check if running in World App
        const isWorldApp = window.navigator.userAgent.includes('worldapp') || 
                          window.navigator.userAgent.includes('MiniKit')


        if (!isWorldApp) {
          setInitialized(true)
          return
        }

        // Check if MiniKit is already installed
        if (MiniKit.isInstalled && MiniKit.isInstalled()) {
          setInitialized(true)
          return
        }

        // Install MiniKit
        await MiniKit.install(appId)
        setInitialized(true)
      } catch (error) {
        // Don't throw - allow app to continue without MiniKit
        setInitialized(true)
      }
    }

    initializeMiniKit()
  }, [initialized])

  return null
}
