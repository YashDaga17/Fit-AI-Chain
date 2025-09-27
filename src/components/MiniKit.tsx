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
  Zap,
  Camera,
  Trophy,
  Target,
  Lock,
  Home
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
          
          const now = Date.now()
          const verificationAge = now - (parsed.timestamp || 0)
          const twentyFourHours = 24 * 60 * 60 * 1000
          
          if (parsed && parsed.verified && verificationAge < twentyFourHours) {
            setIsVerified(true)
            router.push('/tracker')
          } else {
            localStorage.removeItem('worldid_verification')
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error)
        localStorage.removeItem('worldid_verification')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span className="text-3xl">🍎</span>
              </div>
              <h1 className="text-3xl font-bold mb-3">Fit AI Chain</h1>
              <p className="text-white/90 text-lg">
                AI-powered calorie tracking with gamified rewards
              </p>
            </div>
            
            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  World App Required
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  Experience secure, human-verified calorie tracking with the best mobile interface. World ID ensures a trusted community.
                </p>
              </div>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center border border-orange-200">
                  <div className="w-8 h-8 bg-orange-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Camera className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium text-orange-900">AI Analysis</div>
                  <div className="text-xs text-orange-700 mt-1">Instant calorie detection</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 text-center border border-red-200">
                  <div className="w-8 h-8 bg-red-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-sm font-medium text-red-900">Earn XP</div>
                  <div className="text-xs text-red-700 mt-1">Level up your health</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 text-center border border-orange-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-200 to-red-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium text-orange-900">Compete</div>
                  <div className="text-xs text-orange-700 mt-1">Global leaderboard</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 text-center border border-red-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-200 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-sm font-medium text-red-900">Secure</div>
                  <div className="text-xs text-red-700 mt-1">Human-verified only</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-4 border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Getting Started
                </h3>
                <div className="space-y-2 text-sm text-orange-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-800">1</div>
                    <span>Download & install World App</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-800">2</div>
                    <span>Complete World ID verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-800">3</div>
                    <span>Search for "Fit AI Chain"</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-800">4</div>
                    <span>Start tracking & earning XP!</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all"
                onClick={() => window.open('https://worldapp.org/', '_blank')}
              >
                <Smartphone className="w-5 h-5 mr-3" />
                Download World App
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Join thousands of users tracking calories with AI
                </p>
                
                {/* Development helper - only show in dev mode */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('worldid_verification')
                      localStorage.removeItem('user_stats')
                      localStorage.removeItem('food_entries')
                      window.location.reload()
                    }}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    [Dev] Clear All Data
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span className="text-3xl">🍎</span>
              </div>
              <h1 className="text-3xl font-bold mb-3">Welcome to Fit AI Chain</h1>
              <p className="text-white/90 text-lg">
                Your AI-powered health companion
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 space-y-6">
            {!isVerified && (
              <>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Verify Your Humanity
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Join a trusted community of real humans tracking their health with AI-powered analysis.
                  </p>
                </div>

                {verificationError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-red-800 font-medium text-sm">Verification Failed</div>
                        <p className="text-red-600 text-xs mt-1">{verificationError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleVerification}
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-3" />
                      Verify with World ID
                    </>
                  )}
                </Button>

                {/* What's Next Section */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-orange-200 rounded-xl flex items-center justify-center">
                      <Zap className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-bold text-orange-800 text-lg">What's Next?</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-xl p-3 text-center border border-orange-100">
                      <div className="w-6 h-6 bg-orange-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Camera className="w-3 h-3 text-orange-600" />
                      </div>
                      <div className="text-xs font-medium text-gray-900">Snap Food</div>
                      <div className="text-xs text-gray-600">AI analyzes instantly</div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 text-center border border-red-100">
                      <div className="w-6 h-6 bg-red-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Zap className="w-3 h-3 text-red-600" />
                      </div>
                      <div className="text-xs font-medium text-gray-900">Earn XP</div>
                      <div className="text-xs text-gray-600">Level up daily</div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 text-center border border-orange-100">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-200 to-red-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Trophy className="w-3 h-3 text-orange-600" />
                      </div>
                      <div className="text-xs font-medium text-gray-900">Compete</div>
                      <div className="text-xs text-gray-600">Global rankings</div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 text-center border border-red-100">
                      <div className="w-6 h-6 bg-orange-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Target className="w-3 h-3 text-orange-600" />
                      </div>
                      <div className="text-xs font-medium text-gray-900">Track Goals</div>
                      <div className="text-xs text-gray-600">Monitor progress</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Secure • Private • Human-verified community
                  </p>
                  
                  {/* Development helper - only show in dev mode */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => {
                        localStorage.removeItem('worldid_verification')
                        localStorage.removeItem('user_stats')
                        localStorage.removeItem('food_entries')
                        window.location.reload()
                      }}
                      className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      [Dev] Clear All Data
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
