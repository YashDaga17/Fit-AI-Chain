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
        
        console.log('MiniKit initialization:', { 
          isWorldApp, 
          appId,
          userAgent: window.navigator.userAgent.substring(0, 50)
        })

        if (!isWorldApp) {
          console.log('Not running in World App, skipping MiniKit installation')
          setInitialized(true)
          return
        }

        // Check if MiniKit is already installed
        if (MiniKit.isInstalled && MiniKit.isInstalled()) {
          console.log('MiniKit is already installed')
          setInitialized(true)
          return
        }

        // Install MiniKit
        console.log('Installing MiniKit with app_id:', appId)
        await MiniKit.install(appId)
        console.log('MiniKit installed successfully')
        setInitialized(true)
      } catch (error) {
        console.error('Error initializing MiniKit:', error)
        // Don't throw - allow app to continue without MiniKit
        setInitialized(true)
      }
    }

    initializeMiniKit()
  }, [initialized])

  return null
}
