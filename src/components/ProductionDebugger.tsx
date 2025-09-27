'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface EnvironmentCheck {
  name: string
  status: 'success' | 'warning' | 'error' | 'info'
  message: string
  value?: string
}

export function ProductionDebugger() {
  const [checks, setChecks] = useState<EnvironmentCheck[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show when explicitly requested with debug=true in URL
    const shouldShow = typeof window !== 'undefined' && window.location.search.includes('debug=true')
    setIsVisible(shouldShow)

    if (shouldShow) {
      performEnvironmentChecks()
    }
  }, [])

  const performEnvironmentChecks = async () => {
    const newChecks: EnvironmentCheck[] = []

    // Environment Variables Check
    const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID
    newChecks.push({
      name: 'NEXT_PUBLIC_WORLDCOIN_APP_ID',
      status: appId ? (appId.startsWith('app_') ? 'success' : 'error') : 'error',
      message: appId 
        ? (appId.startsWith('app_') ? 'Valid format' : 'Invalid format - must start with "app_"')
        : 'Missing - check environment variables',
      value: appId ? `${appId.substring(0, 15)}...` : undefined
    })

    const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION
    newChecks.push({
      name: 'NEXT_PUBLIC_WORLDCOIN_ACTION',
      status: action ? 'success' : 'warning',
      message: action ? 'Configured' : 'Not configured - using default "verify"',
      value: action || 'verify'
    })

    const signal = process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL
    newChecks.push({
      name: 'NEXT_PUBLIC_WORLDCOIN_SIGNAL',
      status: 'info',
      message: 'Optional signal value',
      value: signal || '(empty)'
    })

    // World App Detection
    const isWorldApp = typeof window !== 'undefined' && 
      (window.navigator.userAgent.includes('worldapp') || (window as any).worldApp !== undefined)
    
    newChecks.push({
      name: 'World App Detection',
      status: isWorldApp ? 'success' : 'warning',
      message: isWorldApp ? 'Running in World App' : 'Not detected - may need QR code',
      value: typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'
    })

    // MiniKit Availability
    try {
      // Dynamic import and check MiniKit availability
      const minikit = await import('@worldcoin/minikit-js')
      const isWorldApp = typeof window !== 'undefined' && 
        (window.navigator.userAgent.includes('worldapp') || (window as any).worldApp !== undefined)
      
      const miniKitInstalled = isWorldApp && typeof minikit.MiniKit !== 'undefined'
      
      newChecks.push({
        name: 'MiniKit Availability',
        status: miniKitInstalled ? 'success' : 'warning',
        message: miniKitInstalled ? 'MiniKit is available' : 'MiniKit not available or not in World App',
      })
    } catch (error) {
      newChecks.push({
        name: 'MiniKit Availability',
        status: 'error',
        message: 'Error loading MiniKit module',
      })
    }

    // API Endpoint Check
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          test: true,
          timestamp: Date.now() 
        })
      })
      
      const responseData = await response.text()
      
      newChecks.push({
        name: 'API Endpoint',
        status: response.status === 400 ? 'success' : 'warning',
        message: response.status === 400 ? 'API responding correctly' : `Unexpected response (${response.status})`,
        value: `Status: ${response.status}`
      })
    } catch (error) {
      newChecks.push({
        name: 'API Endpoint',
        status: 'error',
        message: 'API endpoint unreachable',
        value: error instanceof Error ? error.message : 'Network error'
      })
    }

    // HTTPS Check
    const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    
    newChecks.push({
      name: 'HTTPS Protocol',
      status: isHTTPS || isDev ? 'success' : 'error',
      message: isHTTPS ? 'Using HTTPS' : isDev ? 'Development (HTTP OK)' : 'HTTPS required for production',
      value: typeof window !== 'undefined' ? window.location.protocol + '//' + window.location.host : 'N/A'
    })

    setChecks(newChecks)
  }

  if (!isVisible) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'info': return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-md z-50 border-2 border-orange-200 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          Production Debug Info
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 max-h-96 overflow-y-auto">
        {checks.map((check, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}
          >
            <div className="flex items-start gap-2">
              {getStatusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{check.name}</div>
                <div className="text-xs text-gray-600 mt-1">{check.message}</div>
                {check.value && (
                  <div className="text-xs text-gray-500 mt-1 font-mono bg-white/50 px-2 py-1 rounded">
                    {check.value}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <button
          onClick={performEnvironmentChecks}
          className="w-full text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 px-3 rounded-lg border border-orange-200 transition-colors"
        >
          Refresh Checks
        </button>
        
        <div className="text-xs text-gray-500 text-center mt-2">
          Add ?debug=true to URL to show in production
        </div>
      </CardContent>
    </Card>
  )
}
