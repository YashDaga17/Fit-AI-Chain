'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { saveUserDataSafely } from '@/utils/userDataManager'

function VerifyCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing verification...')

  useEffect(() => {
    const handleVerificationCallback = async () => {
      try {
        // Get verification data from URL parameters
        const proof = searchParams.get('proof')
        const merkleRoot = searchParams.get('merkle_root')
        const nullifierHash = searchParams.get('nullifier_hash')
        const verificationLevel = searchParams.get('verification_level')
        
        // Get pending verification data from sessionStorage
        const pendingVerification = sessionStorage.getItem('worldid_verification_pending')
        
        if (!pendingVerification) {
          throw new Error('No pending verification found')
        }
        
        const { appId, action } = JSON.parse(pendingVerification)
        
        if (!proof || !merkleRoot || !nullifierHash) {
          throw new Error('Incomplete verification data received')
        }

        console.log('Processing World ID verification callback...')
        
        // Send verification to backend
        const verifyResponse = await fetch('/api/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payload: {
              proof,
              merkle_root: merkleRoot,
              nullifier_hash: nullifierHash,
              verification_level: verificationLevel || 'device'
            },
            action: action,
            signal: '',
          }),
        })

        const verifyData = await verifyResponse.json()
        
        if (verifyData.verified) {
          // Store verification
          const verificationData = {
            verified: true,
            timestamp: Date.now(),
            action: action,
            nullifierHash: nullifierHash,
            verificationType: 'worldid' as const,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          }
          
          saveUserDataSafely({ verification: verificationData })
          
          // Clean up session storage
          sessionStorage.removeItem('worldid_verification_pending')
          
          setStatus('success')
          setMessage('Verification successful! Redirecting to tracker...')
          
          // Redirect to tracker after delay
          setTimeout(() => {
            router.push('/tracker')
          }, 2000)
          
        } else {
          throw new Error(verifyData.error || 'Verification failed')
        }
        
      } catch (error) {
        console.error('Verification callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Verification failed')
        
        // Redirect back to home after delay
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    handleVerificationCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
        <CardContent className="p-8 text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">Processing Verification</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verification Successful!</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Redirecting back to home...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Loading fallback component
function VerifyCallbackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
        <CardContent className="p-8 text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Preparing verification...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyCallbackPage() {
  return (
    <Suspense fallback={<VerifyCallbackLoading />}>
      <VerifyCallbackContent />
    </Suspense>
  )
}
