import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MiniKit } from '@worldcoin/minikit-js'

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  connect: () => Promise<void>
  disconnect: () => void
  verifyWorldID: () => Promise<boolean>
}

export function useAuth(): AuthState & AuthActions {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    isLoading: true,
    error: null
  })

  // Check existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('wallet_auth')
        if (authData) {
          const parsed = JSON.parse(authData)
          // Only check if auth exists for this session (no time-based expiry)
          // This means auth will persist until browser/tab is closed or manually cleared
          if (parsed.username) {
            setAuthState({
              isAuthenticated: true,
              username: parsed.username,
              isLoading: false,
              error: null
            })
            return
          } else {
            localStorage.removeItem('wallet_auth')
          }
        }
      } catch (error) {
        localStorage.removeItem('wallet_auth')
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }

    checkAuth()
  }, [])

  const connect = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'MiniKit not available. Please open in World App.',
        isLoading: false 
      }))
      return
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Get nonce
      const nonceRes = await fetch('/api/nonce')
      if (!nonceRes.ok) throw new Error('Failed to get nonce')
      const { nonce } = await nonceRes.json()

      // Request wallet auth
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        statement: "Sign in to Fit AI Chain to track your fitness journey",
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error_code || 'Authentication failed')
      }

      // Complete SIWE
      const siweRes = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      })

      if (!siweRes.ok) throw new Error('SIWE verification failed')
      const result = await siweRes.json()

      if (result.isValid) {
        const username = MiniKit.user?.username || result.address?.substring(0, 8)
        
        // Store auth data for this session only
        localStorage.setItem('wallet_auth', JSON.stringify({
          username,
          verified: true,
          connectedAt: new Date().toISOString()
        }))

        // Sync user with database
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        })

        setAuthState({
          isAuthenticated: true,
          username,
          isLoading: false,
          error: null
        })

        router.push('/tracker')
      } else {
        throw new Error('Verification failed')
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Connection failed. Please try again.',
        isLoading: false
      }))
    }
  }, [router])

  const disconnect = useCallback(() => {
    localStorage.removeItem('wallet_auth')
    setAuthState({
      isAuthenticated: false,
      username: null,
      isLoading: false,
      error: null
    })
    router.push('/')
  }, [router])

  const verifyWorldID = useCallback(async (): Promise<boolean> => {
    if (!MiniKit.isInstalled()) {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'MiniKit is not available. Please open this app in World App.',
      }))
      return false
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Trigger World ID verification
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'verify-human-fitaichain',
        verification_level: 'orb' as any,
        signal: '',
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error_code || 'Verification failed')
      }

      // Verify the proof on backend
      const response = await fetch('/api/world-id/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload,
          action: 'verify-human-fitaichain',
        }),
      })

      if (!response.ok) {
        throw new Error('Backend verification failed')
      }

      const data = await response.json()
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return data.success
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Verification failed. Please try again.',
        isLoading: false
      }))
      return false
    }
  }, [])

  return {
    ...authState,
    connect,
    disconnect,
    verifyWorldID
  }
}
