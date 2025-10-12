'use client'

import { useState } from 'react'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'

interface UseWorldIDActionsReturn {
  verifyHuman: () => Promise<{ success: boolean; nullifier: string } | null>
  verifyDailyFoodLog: () => Promise<{ success: boolean; nullifier: string } | null>
  isVerifying: boolean
  error: string | null
}

/**
 * Custom hook for World ID incognito actions
 * Based on World ID API documentation
 */
export function useWorldIDActions(): UseWorldIDActionsReturn {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyAction = async (action: string, signal?: string) => {
    if (!MiniKit?.isInstalled()) {
      setError('World App not detected. Please open in World App.')
      return null
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Trigger MiniKit verify command
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: action,
        signal: signal || '',
        verification_level: VerificationLevel.Device, // Highest security
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error_code || 'Verification failed')
      }

      // Verify proof on backend
      const response = await fetch('/api/world-id/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload,
          action: action,
          signal: signal || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Backend verification failed')
      }

      const result = await response.json()
      
      return {
        success: result.success,
        nullifier: result.nullifier_hash,
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Verification failed'
      setError(errorMsg)
      console.error('World ID action error:', errorMsg)
      return null
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyHuman = async () => {
    return verifyAction('verify-human')
  }

  const verifyDailyFoodLog = async () => {
    const today = new Date().toISOString().split('T')[0]
    return verifyAction('daily-food-log', today)
  }

  return {
    verifyHuman,
    verifyDailyFoodLog,
    isVerifying,
    error,
  }
}
