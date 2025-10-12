"use client"

import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

export type WorldIDAction = 
  | 'verify-human'
  | 'daily-food-log'
  | 'claim-daily-reward'
  | 'vote-best-food'
  | 'join-challenge'

interface VerifyOptions {
  action: WorldIDAction
  signal?: string
  verificationLevel?: VerificationLevel
}

/**
 * Verify a World ID action using MiniKit
 * @param options - Verification options
 * @returns true if verification successful, false otherwise
 */
export async function verifyWorldIDAction(options: VerifyOptions): Promise<boolean> {
  const { action, signal = '', verificationLevel = VerificationLevel.Device } = options
  
  try {
    if (!MiniKit.isInstalled()) {
      console.warn('MiniKit not installed')
      return false
    }

    console.log(`🌍 Starting World ID verification for action: ${action}`)

    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action,
      signal,
      verification_level: verificationLevel,
    })

    if (finalPayload.status === 'error') {
      console.error('World ID verification failed:', finalPayload)
      return false
    }

    // Verify the proof on the backend
    const response = await fetch('/api/world-id/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: finalPayload as ISuccessResult,
        action,
        signal,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Backend verification failed:', error)
      return false
    }

    const result = await response.json()
    console.log('✅ World ID verification successful:', result)
    return result.verified === true || result.verifyRes?.success === true
  } catch (error) {
    console.error('World ID verification error:', error)
    return false
  }
}

/**
 * Verify a user is human (one-time verification)
 */
export async function verifyHuman(): Promise<boolean> {
  return verifyWorldIDAction({
    action: 'verify-human',
    verificationLevel: VerificationLevel.Device, // Highest level for human verification
  })
}

/**
 * Verify daily food log entry (max 3 per day)
 */
export async function verifyDailyFoodLog(foodName: string): Promise<boolean> {
  return verifyWorldIDAction({
    action: 'daily-food-log',
    signal: foodName,
    verificationLevel: VerificationLevel.Device,
  })
}

/**
 * Verify daily reward claim (once per day)
 */
export async function verifyDailyReward(): Promise<boolean> {
  return verifyWorldIDAction({
    action: 'claim-daily-reward',
    verificationLevel: VerificationLevel.Device,
  })
}

/**
 * Verify food voting (once per vote)
 */
export async function verifyFoodVote(foodId: string): Promise<boolean> {
  return verifyWorldIDAction({
    action: 'vote-best-food',
    signal: foodId,
    verificationLevel: VerificationLevel.Device,
  })
}

/**
 * Verify challenge participation (once per challenge)
 */
export async function verifyJoinChallenge(challengeId: string): Promise<boolean> {
  return verifyWorldIDAction({
    action: 'join-challenge',
    signal: challengeId,
    verificationLevel: VerificationLevel.Device,
  })
}
