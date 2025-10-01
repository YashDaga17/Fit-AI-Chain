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
import { logEnvironmentStatus } from '@/utils/environmentValidation'
import { initializeNewUserData, loadUserDataSafely, saveUserDataSafely, createGuestVerification } from '@/utils/userDataManager'

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

  static async walletAuth() {
    try {
      const miniKit = await this.getInstance()
      if (miniKit && miniKit.commandsAsync && miniKit.commandsAsync.walletAuth) {
        const nonce = Math.random().toString(36).substring(2, 15)
        const requestId = Math.random().toString(36).substring(2, 15)
        
        const response = await miniKit.commandsAsync.walletAuth({
          nonce,
          requestId,
          expirationTime: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
          notBefore: new Date(),
        })

        if (!response || !response.commandPayload) {
          throw new Error('No response from wallet authentication')
        }

        const payload = response.commandPayload as any
        
        if (payload.status === 'error') {
          throw new Error(`Wallet authentication failed: ${payload.error_code || 'Unknown error'}`)
        }

        if (payload.status === 'success') {
          return { 
            address: payload.address, 
            signature: payload.signature,
            message: payload.message
          }
        }

        throw new Error('Unexpected wallet authentication response')
      }
    } catch (error) {
      console.error('Failed to authenticate with MiniKit:', error)
      throw error
    }
    throw new Error('MiniKit wallet authentication not available')
  }
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMiniKit = async () => {
      try {
        // Log environment status for debugging (but don't throw on validation errors)
        const validation = logEnvironmentStatus()
        
        // Check for app ID with multiple possible environment variable names
        const appId = process.env.NEXT_PUBLIC_WLD_APP_ID || 
                     process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || 
                     process.env.WLD_APP_ID ||
                     process.env.APP_ID
        if (!appId) {
          console.warn('World ID app ID not configured - World App features will be limited')
          setIsInitialized(true) // Still allow app to work without World ID
          return
        }

        // Only initialize MiniKit if we're in World App
        const isWorldApp = typeof window !== 'undefined' && window.navigator.userAgent.includes('worldapp')
        if (isWorldApp) {
          await SafeMiniKit.install(appId as `app_${string}`)
        }
        
        setIsInitialized(true)
      } catch (err) {
        console.error('MiniKit initialization error:', err)
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
            // Clear expired verification
            localStorage.removeItem('worldid_verification')
          }
        } else {
          // Initialize new user data structure
          console.log('New user detected - initializing default data')
          initializeNewUserDataLocal()
        }
      } catch (error) {
        console.error('Error checking verification status:', error)
        localStorage.removeItem('worldid_verification')
        // Initialize for new user on error
        initializeNewUserDataLocal()
      }
    }
  }, [mounted, router])

  // Initialize default data for new users
  const initializeNewUserDataLocal = () => {
    try {
      const defaultData = initializeNewUserData()
      saveUserDataSafely({
        stats: defaultData.stats,
        preferences: defaultData.preferences,
        entries: defaultData.entries
      })
      console.log('Initialized new user data')
    } catch (error) {
      console.error('Error initializing new user data:', error)
    }
  }

  const handleWalletAuth = async () => {
    setIsVerifying(true)
    setVerificationError(null)

    try {
      console.log('Starting wallet authentication...')
      
      // Check if MiniKit is available
      const miniKitInstalled = await SafeMiniKit.isInstalled()
      console.log('MiniKit availability:', { miniKitInstalled, isWorldApp })
      
      if (!miniKitInstalled) {
        throw new Error('MiniKit is not available. Please make sure you are using World App.')
      }

      // Use wallet authentication for better reliability
      const walletResult = await SafeMiniKit.walletAuth()
      console.log('Wallet authentication successful:', { 
        hasAddress: !!walletResult.address,
        hasSignature: !!walletResult.signature 
      })

      // Create a username from the wallet address
      const username = `User${walletResult.address.slice(-6)}`

      // Store wallet authentication data
      const authData = {
        verified: true,
        timestamp: Date.now(),
        address: walletResult.address,
        signature: walletResult.signature,
        message: walletResult.message,
        username: username,
        verificationType: 'wallet' as const,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      }
      
      saveUserDataSafely({ verification: authData })
      console.log('Wallet authentication data saved successfully')

      setVerificationSuccess(true)
      
      // Redirect to tracker after short delay
      setTimeout(() => {
        router.push('/tracker')
      }, 1500)

    } catch (error) {
      console.error('Wallet authentication error:', error)
      setVerificationError(error instanceof Error ? error.message : 'Wallet authentication failed')
    } finally {
      setIsVerifying(false)
    }
  }
      })

      let response
      try {
        response = await SafeMiniKit.verify(verifyPayload)
        console.log('MiniKit verification response:', {
          success: response?.success,
          hasNullifierHash: !!response?.nullifier_hash,
          hasProof: !!response?.proof,
          errorMessage: response?.error_message,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : []
        })
      } catch (miniKitError) {
        console.error('MiniKit verification error:', miniKitError)
        throw new Error(`MiniKit verification failed: ${miniKitError instanceof Error ? miniKitError.message : 'Unknown error'}`)
      }

      if (!response) {
        throw new Error('No response from MiniKit verification')
      }

      if (!response.success) {
        throw new Error(response.error_message || 'MiniKit verification was not successful')
      }

      // If we get here, verification was successful
      console.log('MiniKit verification successful, verifying with backend...')
      
      const backendPayload = {
        payload: response,
        action: verifyPayload.action,
        signal: verifyPayload.signal,
      }
      
      console.log('Sending to backend:', {
        hasPayload: !!backendPayload.payload,
        payloadType: typeof backendPayload.payload,
        payloadKeys: backendPayload.payload ? Object.keys(backendPayload.payload) : [],
        action: backendPayload.action,
        signal: backendPayload.signal,
        nullifierHash: backendPayload.payload?.nullifier_hash ? 'present' : 'missing'
      })
      
      // Verify with backend
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': typeof window !== 'undefined' ? window.navigator.userAgent : ''
        },
        body: JSON.stringify(backendPayload),
      })

      const responseText = await verifyResponse.text()
      console.log('Backend response status:', verifyResponse.status)
      console.log('Backend response headers:', Object.fromEntries(verifyResponse.headers.entries()))
      
      let verifyData
      try {
        verifyData = JSON.parse(responseText)
        console.log('Backend verification result:', {
          verified: verifyData.verified,
          status: verifyData.status,
          hasError: !!verifyData.error,
          errorMessage: verifyData.error,
          hasVerifyRes: !!verifyData.verifyRes
        })
      } catch (parseError) {
        console.error('Failed to parse backend response:', responseText)
        throw new Error('Invalid response from verification server')
      }

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || `Verification failed with status ${verifyResponse.status}`)
      }
      
      if (verifyData.verified) {
        // Store verification with enhanced data
        const verificationData = {
          verified: true,
          timestamp: Date.now(),
          action: verifyPayload.action,
          nullifierHash: response.nullifier_hash,
          verificationType: 'worldid',
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        }
        
        localStorage.setItem('worldid_verification', JSON.stringify(verificationData))
        console.log('Verification completed successfully')
        setIsVerified(true)
        
        // Small delay to show success state before navigation
        setTimeout(() => {
          router.push('/tracker')
        }, 1000)
      } else {
        throw new Error(verifyData.error || 'Verification was not successful')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      console.error('Verification process error:', {
        error: errorMessage,
        type: typeof error,
        isWorldApp,
        timestamp: new Date().toISOString()
      })
      setVerificationError(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle guest mode for non-World App users
  const handleGuestMode = () => {
    const guestVerificationData = createGuestVerification()
    
    saveUserDataSafely({
      verification: guestVerificationData
    })
    
    console.log('Guest mode activated')
    setIsVerified(true)
    
    // Initialize guest user data
    initializeNewUserDataLocal()
    
    setTimeout(() => {
      router.push('/tracker')
    }, 1000)
  }

  // Handle World ID verification for web users
  const handleWebVerification = async () => {
    setIsVerifying(true)
    setVerificationError(null)

    try {
      console.log('Starting web-based World ID verification...')
      
      // Check environment configuration
      const appId = process.env.NEXT_PUBLIC_WLD_APP_ID || 
                   process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || 
                   process.env.WLD_APP_ID ||
                   process.env.APP_ID
                   
      const action = process.env.NEXT_PUBLIC_WLD_ACTION || 
                    process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || 
                    'verify-human'

      if (!appId) {
        throw new Error('World ID app configuration missing. Please contact support.')
      }

      // Try to use web verification methods
      if (typeof window !== 'undefined') {
        try {
          // For now, use redirect method since IDKit may not be available
          // In the future, this could be enhanced with QR code generation
          
          const worldIdUrl = `https://worldapp.org/verify?app_id=${encodeURIComponent(appId)}&action=${encodeURIComponent(action)}&redirect_uri=${encodeURIComponent(window.location.origin + '/verify-callback')}`
          
          console.log('Redirecting to World ID verification:', worldIdUrl)
          
          // Store state for return
          sessionStorage.setItem('worldid_verification_pending', JSON.stringify({
            timestamp: Date.now(),
            appId,
            action
          }))
          
          // Show user what's happening
          setVerificationError('Redirecting to World ID verification...')
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = worldIdUrl
          }, 1500)
          
        } catch (redirectError) {
          console.error('Failed to redirect to World ID:', redirectError)
          throw new Error('World ID verification not available in web browser. Please try downloading World App or use Guest Mode.')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Web verification failed'
      console.error('Web verification error:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      })
      setVerificationError(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }
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

  // Show success state when verified (before navigation)
  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verification Successful!</h2>
            <p className="text-gray-600">Redirecting to your tracker...</p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" />
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
                  Join Fit AI Chain
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  Choose how you'd like to access the app. World ID provides secure human verification, or try Guest Mode for immediate access.
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
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Verification Options
                </h3>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 mt-0.5">1</div>
                    <div>
                      <div className="font-medium">World ID Verification</div>
                      <div className="text-blue-600 text-xs">Secure human verification with blockchain proof</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 mt-0.5">2</div>
                    <div>
                      <div className="font-medium">World App (Recommended)</div>
                      <div className="text-blue-600 text-xs">Best experience with mobile app integration</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 mt-0.5">3</div>
                    <div>
                      <div className="font-medium">Guest Mode (7 days)</div>
                      <div className="text-blue-600 text-xs">Try all features without verification</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all"
                onClick={handleWebVerification}
                disabled={isVerifying}
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
              
              <Button 
                variant="outline"
                className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium py-4 rounded-2xl"
                onClick={() => window.open('https://worldapp.org/', '_blank')}
              >
                <Smartphone className="w-5 h-5 mr-3" />
                Download World App
              </Button>
              
              {/* Guest Mode Option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or try without verification</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                className="w-full border-2 border-orange-200 text-orange-700 hover:bg-orange-50 font-medium py-4 rounded-2xl"
                onClick={handleGuestMode}
              >
                <Home className="w-5 h-5 mr-3" />
                Continue as Guest
              </Button>
              
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                <div className="text-xs text-orange-700 text-center">
                  <strong>Guest Mode:</strong> Try the app with limited features. Your data stays on this device only.
                </div>
              </div>
              
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
                  <div className={`border rounded-2xl p-4 ${
                    verificationError.includes('Redirecting') 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationError.includes('Redirecting')
                          ? 'bg-blue-100'
                          : 'bg-red-100'
                      }`}>
                        {verificationError.includes('Redirecting') ? (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          verificationError.includes('Redirecting')
                            ? 'text-blue-800'
                            : 'text-red-800'
                        }`}>
                          {verificationError.includes('Redirecting') ? 'Processing...' : 'Verification Failed'}
                        </div>
                        <p className={`text-xs mt-1 ${
                          verificationError.includes('Redirecting')
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}>
                          {verificationError}
                        </p>
                        {verificationError.includes('web browser') && !verificationError.includes('Redirecting') && (
                          <p className="text-red-500 text-xs mt-2">
                            💡 Try downloading World App or use Guest Mode to continue
                          </p>
                        )}
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
