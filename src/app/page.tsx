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

  // Expose a global function for clearing auth (dev testing)
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).clearAuth = () => {
        localStorage.removeItem("wallet_auth")
        console.log(" Auth cleared! Refresh the page.")
        window.location.reload()
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const appId = process.env.NEXT_PUBLIC_WLD_APP_ID
      console.log('🔧 Initializing MiniKit with App ID:', appId)
      
      if (!appId) {
        console.error('❌ NEXT_PUBLIC_WLD_APP_ID is not defined!')
        setIsWorldApp(false)
        setIsInitialized(true)
        return
      }
      
      if (typeof window !== "undefined" && !MiniKit.isInstalled()) {
        console.log('📦 Installing MiniKit...')
        MiniKit.install(appId)
        console.log('✅ MiniKit installed')
      } else {
        console.log('✅ MiniKit already installed')
      }
      
      const miniKitInstalled = MiniKit.isInstalled()
      const userAgent = navigator.userAgent.toLowerCase()
      const isWorldAppUA = userAgent.includes('worldapp') || userAgent.includes('minikit')
      const hasWorldBridge = typeof (window as any).WorldApp !== 'undefined'
      const inWorldApp = miniKitInstalled || isWorldAppUA || hasWorldBridge
      
      console.log('🌍 Environment Check:', {
        miniKitInstalled,
        isWorldAppUA,
        hasWorldBridge,
        inWorldApp
      })
      
      setIsWorldApp(inWorldApp)
    } catch (error) {
      console.error('MiniKit init error:', error)
      setIsWorldApp(false)
    }

    // Check existing auth
    const existingAuth = localStorage.getItem("wallet_auth")
    if (existingAuth) {
      try {
        const authData = JSON.parse(existingAuth)
        const connectedAt = new Date(authData.connectedAt)
        const now = new Date()
        const daysDiff = (now.getTime() - connectedAt.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysDiff >= 7 || !authData.username) {
          // Auth expired, clear it
          localStorage.removeItem("wallet_auth")
          setIsAuthenticated(false)
          setIsInitialized(true)
        } else {
          // Auth valid, redirect to tracker
          setIsAuthenticated(true)
          // Small delay to prevent flash
          setTimeout(() => router.push("/tracker"), 100)
        }
      } catch (error) {
        localStorage.removeItem("wallet_auth")
        setIsAuthenticated(false)
        setIsInitialized(true)
      }
    } else {
      // No auth, show login
      setIsAuthenticated(false)
      setIsInitialized(true)
    }
  }, [router])

  const handleConnect = async (address: string, username?: string) => {
    console.log('🔐 Connect handler called:', { address, username })
    
    // Use username if available, otherwise use address
    const identifier = username || address
    
    if (!identifier) {
      console.error('No username or address provided')
      return
    }
    
    // Store only username locally (no wallet address for leaderboard)
    localStorage.setItem("wallet_auth", JSON.stringify({ 
      username: identifier,
      verified: true,
      connectedAt: new Date().toISOString()
    }))

    // Sync user with database (username only)
    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier }),
      })

      if (!response.ok) {
        console.error('Failed to sync user:', await response.text())
      } else {
        const data = await response.json()
        console.log('✅ User synced:', data.user)
      }
    } catch (error) {
      console.error('Failed to sync user to database:', error)
    }

    router.push("/tracker")
  }

  // Show loading state only while initializing or redirecting
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

  // Show loading while redirecting authenticated users
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
