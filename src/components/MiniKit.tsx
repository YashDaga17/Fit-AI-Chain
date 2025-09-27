'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MiniKit } from '@worldcoin/minikit-js'
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

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMiniKit = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID) {
          throw new Error('NEXT_PUBLIC_WORLDCOIN_APP_ID is not configured')
        }

        MiniKit.install(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`)
        
        setIsInitialized(true)
      } catch (err) {
        console.error('Failed to initialize MiniKit:', err)
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

  // Check if user is already verified
  useEffect(() => {
    const verificationData = localStorage.getItem('worldid_verification')
    if (verificationData) {
      setIsVerified(true)
      router.push('/calories')
    }
  }, [router])

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setError('MiniKit is not installed. Please open this app in World App.')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = MiniKit.commands.verify({
        action: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || 'track-your-calorie',
        signal: process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL || 'food-tracking',
      })

      if (response) {
        // Store verification result
        localStorage.setItem('worldid_verification', JSON.stringify(response))
        setIsVerified(true)
        
        // Redirect to calorie tracker
        setTimeout(() => {
          router.push('/calories')
        }, 500)
      } else {
        throw new Error('Verification failed - no response received')
      }
    } catch (err) {
      console.error('World ID verification error:', err)
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-green-700">Verified Successfully!</h2>
          <p className="text-green-600">Redirecting to your calorie tracker...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FitAI Chain
          </CardTitle>
          <CardDescription className="text-lg">
            AI-Powered Calorie Tracking with World ID Verification
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">World App Required</p>
                <p className="text-sm text-blue-600">
                  This mini app must be opened within the World App
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">AI-Powered Analysis</p>
                <p className="text-sm text-green-600">
                  Take photos of food for instant calorie tracking
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={isVerifying}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                Verify with World ID
              </>
            )}
          </Button>

          <div className="text-center">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
              🔐 Secure • 🤖 AI-Powered • ⚡ Fast
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
