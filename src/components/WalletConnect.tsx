"use client"

import { useState, useEffect, useMemo } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle, Smartphone } from "lucide-react"

interface WalletConnectProps {
  onConnect: (address: string, username?: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Check if MiniKit is available (for example, if running inside World App)
  const isMiniKitAvailable = useMemo(() => {
    if (typeof window === "undefined") return false
    try {
      return MiniKit.isInstalled()
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    setHasCheckedAuth(true)
  }, [])

  const handleConnect = async () => {
    if (!isMiniKitAvailable) {
      setError("MiniKit not available. Please open in World App.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Get nonce
      const res = await fetch("/api/nonce")
      if (!res.ok) throw new Error('Failed to get nonce')
      
      const { nonce } = await res.json()

      // Request wallet auth
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        statement: "Sign in to Fit AI Chain to track your fitness journey",
      })

      if (finalPayload.status === "error") {
        throw new Error(finalPayload.error_code || "Authentication failed")
      }

      // Complete SIWE
      const response = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      })

      if (!response.ok) throw new Error('SIWE verification failed')
      
      const result = await response.json()

      if (result.isValid) {
        const worldIdUser = await MiniKit.getUserByAddress(result.address)
        const username = worldIdUser?.username || result.address?.substring(0, 8)
        onConnect(result.address, username)
      } else {
        throw new Error("Verification failed")
      }
    } catch (err: any) {
      setError(err.message || "Connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="border-orange-200/50 bg-white/80 p-8 backdrop-blur-sm shadow-xl max-w-md w-full">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
          <svg className="h-10 w-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Fit AI Chain! 🎯</h2>
          <p className="mt-2 text-gray-600">Connect your wallet to start tracking your fitness journey</p>
          <p className="mt-1 text-sm text-gray-500">🔒 Secure authentication required for each session</p>
        </div>

        {!isMiniKitAvailable ? (
          <div className="w-full space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-4 text-left border border-orange-200">
              <Smartphone className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-900 mb-1">📱 Open in World App</p>
                <p className="text-sm text-orange-700">
                  This app needs to run inside World App to access wallet features.
                </p>
                <ol className="mt-2 text-sm text-orange-700 space-y-1 list-decimal list-inside">
                  <li>Open World App on your phone</li>
                  <li>Go to Mini Apps</li>
                  <li>Add this app or scan the QR code</li>
                </ol>
                <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
                  <strong>Debug Info:</strong> MiniKit installed: {(() => {
                    try {
                      return MiniKit.isInstalled() ? 'Yes' : 'No'
                    } catch {
                      return 'No (Error)'
                    }
                  })()}
                </div>
              </div>
            </div>
            
            {/* Dev mode bypass button */}
            <Button
              onClick={() => {
                console.log('🧪 Dev mode bypass triggered')
                const testAddress = "0x" + Math.random().toString(16).substr(2, 40)
                const testUsername = "dev_user_" + Date.now()
                console.log('🧪 Calling onConnect with test data:', { testAddress, testUsername })
                onConnect(testAddress, testUsername)
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              🧪 Dev Mode: Skip (Testing Only)
            </Button>
            
            {/* Force World App mode for testing */}
            <Button
              onClick={() => {
                // Force enable World App mode for testing
                window.location.reload()
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              🔄 Force Refresh Detection
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "🔐 Connect Wallet"
            )}
          </Button>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 w-full">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
