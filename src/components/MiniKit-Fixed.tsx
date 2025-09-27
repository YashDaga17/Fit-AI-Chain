'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Smartphone, 
  Zap
} from 'lucide-react'

interface MiniKitProviderProps {
  children: React.ReactNode
}

// Safe MiniKit wrapper
class SafeMiniKit {
  private static instance: any = null
  
  static async getInstance() {
    if (this.instance) return this.instance
    
    try {
      if (typeof window !== 'undefined' && window.navigator.userAgent.includes('worldapp')) {
        const minikit = await import('@worldcoin/minikit-js')
        this.instance = minikit.MiniKit
        return this.instance
      }
    } catch (error) {
      console.error('Failed to load MiniKit:', error)
    }
    return null
  }
  
  static async isInstalled(): Promise<boolean> {
    try {
      const miniKit = await this.getInstance()
      return miniKit && typeof miniKit.isInstalled === 'function' && miniKit.isInstalled()
    } catch {
      return false
    }
  }
  
  static async install(appId: string) {
    try {
      const miniKit = await this.getInstance()
      if (miniKit && typeof miniKit.install === 'function') {
        miniKit.install(appId)
        return true
      }
    } catch (error) {
      console.error('Failed to install MiniKit:', error)
    }
    return false
  }
  
  static async verify(payload: any) {
    try {
      const miniKit = await this.getInstance()
      if (miniKit && miniKit.commandsAsync && miniKit.commandsAsync.verify) {
        return await miniKit.commandsAsync.verify(payload)
      }
    } catch (error) {
      console.error('Failed to verify with MiniKit:', error)
    }
    return null
  }
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMiniKit = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID) {
          throw new Error('NEXT_PUBLIC_WORLDCOIN_APP_ID is not configured')
        }

        // Only initialize MiniKit if we're in World App
        const isWorldApp = typeof window !== 'undefined' && window.navigator.userAgent.includes('worldapp')
        if (isWorldApp) {
          await SafeMiniKit.install(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`)
        }
        
        setIsInitialized(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize MiniKit')
        setIsInitialized(true) // Continue without MiniKit
      }
    }

    initMiniKit()
  }, [])

  if (error) {
    console.error('MiniKit initialization error:', error)
  }

  return <>{children}</>
}

export function WorldIDVerification() {
  const [mounted, setMounted] = useState(false)
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const router = useRouter()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if running in World App
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isInWorldApp = userAgent.includes('worldapp')
      
      // Use a more reliable check for World App
      const hasWorldAppContext = typeof window !== 'undefined' && 
        (window as any).worldApp !== undefined
      
      setIsWorldApp(isInWorldApp || hasWorldAppContext)
    }
  }, [mounted])

  // Check if user is already verified
  useEffect(() => {
    if (mounted) {
      try {
        const verificationData = localStorage.getItem('worldid_verification')
        if (verificationData) {
          const parsed = JSON.parse(verificationData)
          if (parsed && parsed.verified) {
            setIsVerified(true)
            router.push('/tracker')
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error)
      }
    }
  }, [mounted, router])

  const handleVerification = async () => {
    setIsVerifying(true)
    setVerificationError(null)

    try {
      // Check if MiniKit is available
      const miniKitInstalled = await SafeMiniKit.isInstalled()
      
      if (!miniKitInstalled) {
        throw new Error('MiniKit is not available. Please make sure you are using World App.')
      }

      // Import verification types dynamically
      const { VerificationLevel } = await import('@worldcoin/minikit-js')

      const verifyPayload = {
        action: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || 'verify',
        signal: process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL || '',
        verification_level: VerificationLevel.Device,
      }

      let response
      try {
        response = await SafeMiniKit.verify(verifyPayload)
      } catch (miniKitError) {
        throw new Error('Verification failed. Please try again.')
      }

      if (response && response.success) {
        // Verify with backend
        const verifyResponse = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: response,
            action: verifyPayload.action,
            signal: verifyPayload.signal,
          }),
        })

        if (!verifyResponse.ok) {
          throw new Error('Backend verification failed')
        }

        const verifyData = await verifyResponse.json()
        
        if (verifyData.verified) {
          // Store verification
          const verificationData = {
            verified: true,
            timestamp: Date.now(),
            action: verifyPayload.action,
          }
          
          localStorage.setItem('worldid_verification', JSON.stringify(verificationData))
          setIsVerified(true)
          router.push('/tracker')
        } else {
          throw new Error('Verification was not successful')
        }
      } else {
        throw new Error(response?.error_message || 'Verification failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      setVerificationError(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show message for web users to use World App
  if (!isWorldApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
                <div className="text-4xl">🍎</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Fit AI Chain
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Track calories with AI • Earn XP • Compete with friends
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <Smartphone className="w-16 h-16 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                World App Required
              </h2>
              <p className="text-gray-600">
                Fit AI Chain runs exclusively in the World App for secure human verification and the best mobile experience.
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">How to get started:</h3>
              <ol className="text-sm text-orange-700 space-y-1">
                <li>1. Download the World App</li>
                <li>2. Complete World ID verification</li>
                <li>3. Search for "Fit AI Chain" in the app</li>
                <li>4. Start tracking your calories!</li>
              </ol>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all"
              onClick={() => window.open('https://worldapp.org/', '_blank')}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Get World App
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
              <div className="text-3xl">🍎</div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Fit AI Chain
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Track calories with AI • Earn XP • Compete with friends
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isVerified && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  World ID Verification Required
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-6">
                Verify your humanity with World ID to start tracking calories and earning XP!
              </p>

              {verificationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">Verification Failed</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{verificationError}</p>
                </div>
              )}

              <Button
                onClick={handleVerification}
                disabled={isVerifying}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Verify with World ID
                  </>
                )}
              </Button>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-orange-800">What's Next?</span>
                </div>
                <div className="text-sm text-orange-700 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>📸 Take photos of your food</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>🧠 AI analyzes calories automatically</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>⚡ Earn XP and level up</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>🏆 Compete with friends</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
