"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"
import WalletConnect from "@/components/WalletConnect"

export default function Home() {
  const router = useRouter()
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const appId = process.env.NEXT_PUBLIC_WLD_APP_ID
      
      if (!appId) {
        setIsWorldApp(false)
        setIsInitialized(true)
        return
      }
      
      // Install MiniKit synchronously with error handling
      let miniKitInstalled = false
      try {
        if (typeof window !== "undefined" && !MiniKit.isInstalled()) {
          MiniKit.install(appId)
        }
        miniKitInstalled = MiniKit.isInstalled()
      } catch (error) {
        // MiniKit not available, continue with fallback detection
        miniKitInstalled = false
      }
      
      // Simple World App detection
      const userAgent = navigator.userAgent.toLowerCase()
      const isWorldAppUA = userAgent.includes('worldapp') || userAgent.includes('minikit')
      const hasWorldBridge = typeof (window as any).WorldApp !== 'undefined'
      
      setIsWorldApp(miniKitInstalled || isWorldAppUA || hasWorldBridge)
      
      // Always clear any existing auth when entering the app
      // This ensures wallet connect is always shown
      localStorage.removeItem('wallet_auth')
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Initialization error:', error)
      setIsWorldApp(false)
      setIsInitialized(true)
    }

    // Dev helper - available globally for testing
    (window as any).clearAuth = () => {
      localStorage.removeItem('wallet_auth')
      window.location.reload()
    }
  }, [router])

  // Watch for authentication state changes and provide backup redirect
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Authentication state detected, backup redirect trigger')
      const timer = setTimeout(() => {
        console.log('🔄 Backup redirect to /tracker executing')
        router.push('/tracker')
      }, 200) // Slightly longer delay for backup
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, router])

  const handleConnect = async (address: string, username?: string) => {
    console.log('🔄 handleConnect called with:', { address, username })
    
    const identifier = username || address
    
    if (!identifier) {
      console.error('❌ No identifier provided')
      return
    }
    
    // Set auth for this session only (no persistence)
    const authData = {
      username: identifier,
      verified: true,
      connectedAt: new Date().toISOString()
    }
    
    localStorage.setItem("wallet_auth", JSON.stringify(authData))
    console.log('✅ Auth data stored in localStorage')

    // Sync user with database
    try {
      console.log('🔄 Syncing user with database...')
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier }),
      })
      console.log('✅ User sync completed')
    } catch (error) {
      console.error('⚠️ User sync failed:', error)
      // Continue even if sync fails
    }

    console.log('🔄 Setting authentication state and redirecting...')
    setIsAuthenticated(true)
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      console.log('🔄 Executing redirect to /tracker')
      router.push('/tracker')
    }, 50)
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      {!isWorldApp && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-sm z-10">
          <p className="font-semibold">⚠️ Development Mode</p>
          <p>Open in World App for full features</p>
          <p className="text-xs mt-1">Check console for database status</p>
        </div>
      )}
      {isWorldApp && (
        <div className="absolute top-4 left-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg text-sm z-10">
          <p className="font-semibold">✅ World App Detected</p>
          <p>Full features enabled!</p>
        </div>
      )}
      <WalletConnect onConnect={handleConnect} />
    </div>
  )
}
