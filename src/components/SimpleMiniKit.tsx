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
  User,
  Wallet
} from 'lucide-react'
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
  return <div>{children}</div>
}

export function WorldIDVerification() {
  const router = useRouter()
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Check if we're in World App
    const checkWorldApp = typeof window !== 'undefined' && window.navigator.userAgent.includes('worldapp')
    setIsWorldApp(checkWorldApp)

    // Check existing verification
    const userData = loadUserDataSafely()
    if (userData.verification && userData.verification.verified) {
      const isExpired = userData.verification.expiresAt && userData.verification.expiresAt < Date.now()
      if (!isExpired) {
        setIsVerified(true)
      }
    }
  }, [])

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
        action: 'wallet-auth',
        nullifierHash: `wallet_${walletResult.address}`,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      }
      
      saveUserDataSafely({ verification: authData })
      console.log('Wallet authentication data saved successfully')

      setIsVerified(true)
      
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

  const handleGuestMode = () => {
    console.log('Enabling guest mode...')
    
    // Initialize guest user data
    initializeNewUserData()
    const guestVerification = createGuestVerification()
    saveUserDataSafely({ verification: guestVerification })
    
    setIsVerified(true)
    
    // Redirect to tracker
    setTimeout(() => {
      router.push('/tracker')
    }, 500)
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
            <p className="text-gray-600">Redirecting to your tracker...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Fit AI Chain
          </CardTitle>
          <CardDescription className="text-gray-600">
            AI-powered calorie tracking with gamification
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {verificationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-800">{verificationError}</p>
              </div>
            </div>
          )}

          {isWorldApp ? (
            <div className="space-y-3">
              <Button 
                onClick={handleWalletAuth}
                disabled={isVerifying}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting Wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect with World App
                  </>
                )}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Secure wallet authentication</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    For the best experience, open this app in World App
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Button 
              onClick={handleGuestMode}
              variant="outline"
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              Continue as Guest
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              7-day trial • Local data only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
