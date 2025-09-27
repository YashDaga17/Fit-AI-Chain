'use client'

import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useSession, VerificationState } from '@worldcoin/idkit'
import { useEffect } from 'react'
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
  Apple,
  Copy,
  RefreshCw
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  
  // Check if user is already verified to prevent redirect loops
  useEffect(() => {
    const verificationData = localStorage.getItem('worldid_verification')
    if (verificationData) {
      // User is already verified, redirect to calories page
      router.push('/calories')
      return
    }
  }, [router])
  
  const { status, sessionURI, result, errorCode } = useSession({
    app_id: process.env.NEXT_PUBLIC_APP_ID as `app_${string}`,
    action: process.env.NEXT_PUBLIC_ACTION || 'yash-daga',
    signal: process.env.NEXT_PUBLIC_SIGNAL || 'food-tracking',
  })

  // Redirect to calorie tracker when verification is successful
  useEffect(() => {
    if (status === VerificationState.Confirmed && result) {
      // Store verification result in localStorage for the calorie tracker
      localStorage.setItem('worldid_verification', JSON.stringify(result))
      // Add a small delay to ensure localStorage is saved before redirect
      setTimeout(() => {
        router.push('/calories')
      }, 100)
    }
  }, [status, result, router])

  // Render different UI based on session status
  const renderStatusContent = () => {
    if (!status) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Initializing session...</p>
          </CardContent>
        </Card>
      )
    }

    switch (status) {
      case VerificationState.PreparingClient:
        return (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">Preparing client...</h2>
              <p className="text-gray-600">Loading verification widget</p>
            </CardContent>
          </Card>
        )

      case VerificationState.WaitingForConnection:
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Waiting for connection</CardTitle>
              <CardDescription className="text-lg">Scan the QR code with World App to verify</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {sessionURI && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
                    <QRCodeSVG value={sessionURI} size={256} />
                  </div>
                </div>
              )}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium text-blue-800">Don't have World App?</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Download it from the App Store or Google Play to get started with World ID verification.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )

      case VerificationState.WaitingForApp:
        return (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Connected</h2>
              <p className="text-gray-600">Please complete verification in your World app</p>
            </CardContent>
          </Card>
        )

      case VerificationState.Confirmed:
        return (
          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Successful!</h2>
                <p className="text-gray-600">You've been verified as a unique human.</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <p className="text-sm text-blue-600">Redirecting to calorie tracker...</p>
                </div>
              </div>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Apple className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium text-green-800">Welcome to FitAI Chain!</p>
                      <p className="text-sm text-green-700 mt-1">
                        You can now track your food calories with AI-powered image analysis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-4 text-left">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Proof:</span> {result?.proof.slice(0, 10)}...{result?.proof.slice(-10)}
                    </p>
                    <pre className="whitespace-pre-wrap break-words bg-gray-100 p-3 rounded-md text-xs max-w-full overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(result, null, 2))
                        alert('Proof copied to clipboard!')
                      }}
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Proof
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )

      case VerificationState.Failed:
        return (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
              <p className="text-gray-600">Error: {errorCode || 'Unknown error'}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <h2 className="text-xl font-semibold">Status: {status}</h2>
              {sessionURI && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <QRCodeSVG value={sessionURI} size={256} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Apple className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            FitAI Chain
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            AI-powered food calorie tracking with World ID verification
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center justify-center space-x-2 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">AI Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">World ID Secure</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
              <Apple className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Calorie Tracking</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
          <div className="p-8">
            {renderStatusContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Powered by World ID • Secure • Privacy-first</span>
          </p>
        </div>
      </div>
    </div>
  )
}
