'use client'

import { useState } from 'react'
import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { isMiniKitAvailable } from '@/lib/minikit'

interface WorldIDVerifyProps {
  onSuccess: (result: ISuccessResult) => void
  onError?: (error: any) => void
}

export default function WorldIDVerify({ onSuccess, onError }: WorldIDVerifyProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleVerify = async () => {
    if (!isMiniKitAvailable()) {
      setErrorMessage('MiniKit is not available. Please open this app in World App.')
      setVerificationStatus('error')
      return
    }

    setIsVerifying(true)
    setVerificationStatus('verifying')

    try {
      // Trigger World ID verification
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'verify-human-fitaichain', // This should match your Developer Portal action
        verification_level: VerificationLevel.Device, // or VerificationLevel.Device
        signal: '', // Optional: can add user-specific data
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error_code || 'Verification failed')
      }

      // Verify the proof on your backend
      const response = await fetch('/api/world-id/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          action: 'verify-human-fitaichain',
        }),
      })

      if (!response.ok) {
        throw new Error('Backend verification failed')
      }

      const data = await response.json()
      
      setVerificationStatus('success')
      onSuccess(finalPayload as ISuccessResult)
      
    } catch (error: any) {
      setVerificationStatus('error')
      setErrorMessage(error.message || 'Verification failed. Please try again.')
      onError?.(error)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Verify with World ID
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Verify your unique humanity with World ID to access exclusive features and compete on the leaderboard.
        </p>

        {verificationStatus === 'idle' && (
          <Button 
            onClick={handleVerify} 
            className="w-full"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify with World ID
              </>
            )}
          </Button>
        )}

        {verificationStatus === 'verifying' && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-blue-700">Verifying your identity...</span>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700">Verification successful!</span>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="flex items-center p-4 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div className="flex-1">
              <span className="text-sm text-red-700">{errorMessage}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setVerificationStatus('idle')}
                className="mt-2 w-full"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>✓ Proof of unique humanity</p>
          <p>✓ Privacy-preserving verification</p>
          <p>✓ Sybil-resistant features</p>
        </div>
      </CardContent>
    </Card>
  )
}
