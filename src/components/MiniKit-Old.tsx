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

// Dynamic import types
type MiniKitType = typeof import('@worldcoin/minikit-js').MiniKit
type VerifyCommandInputType = import('@worldcoin/minikit-js').VerifyCommandInput
type VerificationLevelType = import('@worldcoin/minikit-js').VerificationLevel
type ISuccessResultType = import('@worldcoin/minikit-js').ISuccessResult

interface MiniKitProviderProps {
  children: React.ReactNode
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

        // Only initialize MiniKit if it's available (in World App)
        if (typeof MiniKit !== 'undefined') {
          MiniKit.install(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`)
        }
        
        setIsInitialized(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize MiniKit')
      }
    }

    initMiniKit()
  }, [])

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Initialization Error</h2>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!isInitialized) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Initializing FitAI Chain...</p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

export function WorldIDVerification() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if running in World App
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      const userAgent = navigator.userAgent.toLowerCase()
      const isInWorldApp = userAgent.includes('worldapp')
      
      // Safely check MiniKit availability
      let miniKitAvailable = false
      try {
        miniKitAvailable = typeof MiniKit !== 'undefined' && MiniKit.isInstalled()
      } catch (error) {
        // MiniKit might not be available in regular browsers
        miniKitAvailable = false
      }
      
      setIsWorldApp(isInWorldApp || miniKitAvailable)
    }
  }, [mounted])

  // Check if user is already verified
  useEffect(() => {
    const verificationData = localStorage.getItem('worldid_verification')
    if (verificationData) {
      setIsVerified(true)
      router.push('/tracker')
    }

    // Check if running in World App
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent
      const isWorldAppUA = userAgent.includes('WorldApp') || userAgent.includes('World App')
      setIsWorldApp(isWorldAppUA)
    }
  }, [router])

  const handleVerify = async () => {
    // Safely check MiniKit availability
    let miniKitInstalled = false
    try {
      miniKitInstalled = typeof MiniKit !== 'undefined' && MiniKit.isInstalled()
    } catch (error) {
      miniKitInstalled = false
    }
    
    if (!isWorldApp || !miniKitInstalled) {
      setError('Please open this app in the World App to verify your identity.')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const actionId = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || 'track-your-calorie'
      const signalId = process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL || 'food-tracking'
      
      if (!MiniKit || !MiniKit.commandsAsync) {
        throw new Error('MiniKit is not available or not properly initialized')
      }

      const verifyPayload: VerifyCommandInput = {
        action: actionId,
        signal: signalId,
        verification_level: VerificationLevel.Device,
      }
      
      let response
      try {
        response = await MiniKit.commandsAsync.verify(verifyPayload)
      } catch (miniKitError: any) {
        const errorMessage = miniKitError?.message || miniKitError?.toString() || 'Unknown error'
        throw new Error(`MiniKit verification failed: ${errorMessage}`)
      }
      
      const { finalPayload } = response

      // Check for various error conditions
      if (!finalPayload) {
        throw new Error('No verification payload received from World ID')
      }

      if (finalPayload.status === 'error') {
        const errorMsg = finalPayload.error_code 
          ? `World ID Error: ${finalPayload.error_code}` 
          : 'World ID verification failed'
        throw new Error(errorMsg)
      }

      // Validate required fields
      if (!finalPayload.proof || !finalPayload.merkle_root || !finalPayload.nullifier_hash) {
        throw new Error('Incomplete verification data received from World ID')
      }

      // Verify the proof in the backend
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: actionId,
          signal: signalId,
        }),
      })

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text()
        throw new Error(`Backend verification request failed: ${verifyResponse.status}`)
      }

      const verifyResponseJson = await verifyResponse.json()

      if (verifyResponseJson.status !== 200) {
        throw new Error(verifyResponseJson.error || 'Backend verification failed')
      }

      // Store verification result
      localStorage.setItem('worldid_verification', JSON.stringify({
        ...finalPayload,
        verified: true,
        timestamp: Date.now(),
        backendVerified: true,
      }))
      
      setIsVerified(true)
      
      // Redirect to calorie tracker
      setTimeout(() => {
        router.push('/tracker')
      }, 1000)

    } catch (err) {      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Verification failed. Please try again.'
      
      if (err instanceof Error) {
        if (err.message.includes('MiniKit is not available')) {
          errorMessage = 'Please open this app in the World App to verify your identity.'
        } else if (err.message.includes('MiniKit verification failed')) {
          errorMessage = 'World ID verification failed. Please ensure you have a valid World ID and try again.'
        } else if (err.message.includes('Backend verification')) {
          errorMessage = 'Server verification failed. Please try again in a few moments.'
        } else if (err.message.includes('World ID Error')) {
          errorMessage = err.message // Use the specific World ID error
        } else if (err.message.includes('Incomplete verification data')) {
          errorMessage = 'World ID verification was incomplete. Please try again.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <CheckCircle className="h-16 w-16 text-orange-500 mx-auto" />
            <h2 className="text-2xl font-bold text-orange-700">Welcome to FoodTracker!</h2>
            <p className="text-orange-600">Taking you to your dashboard...</p>
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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <Smartphone className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">World App Required</p>
                <p className="text-sm text-orange-600">
                  Verify your humanity to start tracking
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">AI-Powered Analysis</p>
                <p className="text-sm text-yellow-600">
                  Snap food photos for instant calorie counting
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={isVerifying}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Verify & Start Tracking
              </>
            )}
          </Button>

          <div className="text-center">
            <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 px-4 py-1">
              � Earn XP • 📊 Track Progress • 🏆 Leaderboards
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
