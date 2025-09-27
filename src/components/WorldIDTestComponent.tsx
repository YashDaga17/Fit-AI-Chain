'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export function WorldIDTestComponent() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const addResult = (step: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    setResults(prev => [...prev, {
      step,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testWorldIDFlow = async () => {
    setTesting(true)
    setResults([])

    try {
      // Step 1: Environment check
      addResult('Environment', 'info', 'Checking environment variables...', {
        appId: !!process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
        action: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION,
        signal: process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL || '(empty)',
        nodeEnv: process.env.NODE_ENV
      })

      // Step 2: Check World App
      const isWorldApp = typeof window !== 'undefined' && 
        (window.navigator.userAgent.includes('worldapp') || (window as any).worldApp !== undefined)
      
      addResult('World App', isWorldApp ? 'success' : 'error', 
        isWorldApp ? 'Running in World App' : 'Not running in World App', {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) + '...' : 'N/A',
        hasWorldAppContext: typeof window !== 'undefined' && (window as any).worldApp !== undefined
      })

      // Step 3: Test API endpoint
      const apiResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })

      const apiResult = await apiResponse.json()
      
      addResult('API Endpoint', apiResponse.ok || apiResponse.status === 400 ? 'success' : 'error',
        `API responded with ${apiResponse.status}`, {
        status: apiResponse.status,
        response: apiResult
      })

      // Step 4: Try MiniKit loading
      try {
        const minikit = await import('@worldcoin/minikit-js')
        addResult('MiniKit Loading', 'success', 'MiniKit module loaded successfully', {
          hasVerificationLevel: !!minikit.VerificationLevel,
          hasMiniKit: !!minikit.MiniKit
        })

        // Step 5: Test MiniKit installation check (only if in World App)
        if (isWorldApp) {
          try {
            const isInstalled = minikit.MiniKit.isInstalled()
            addResult('MiniKit Installation', isInstalled ? 'success' : 'error',
              isInstalled ? 'MiniKit is installed' : 'MiniKit not installed', {
              isInstalled
            })
          } catch (installError) {
            addResult('MiniKit Installation', 'error', 'Error checking MiniKit installation', {
              error: installError instanceof Error ? installError.message : 'Unknown error'
            })
          }
        } else {
          addResult('MiniKit Installation', 'info', 'Skipped - not in World App', {})
        }

      } catch (minikitError) {
        addResult('MiniKit Loading', 'error', 'Failed to load MiniKit', {
          error: minikitError instanceof Error ? minikitError.message : 'Unknown error'
        })
      }

      // Step 6: Environment validation summary
      const issues = []
      if (!process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID) issues.push('Missing NEXT_PUBLIC_WORLDCOIN_APP_ID')
      if (!process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID?.startsWith('app_')) issues.push('Invalid app ID format')
      if (!isWorldApp) issues.push('Not running in World App')

      addResult('Validation Summary', issues.length === 0 ? 'success' : 'error',
        issues.length === 0 ? 'All checks passed' : `${issues.length} issues found`, {
        issues
      })

    } catch (error) {
      addResult('Test Flow', 'error', 'Test flow failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'info': return <AlertCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'info': return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8 border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-600" />
          World ID Debug Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testWorldIDFlow}
          disabled={testing}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run World ID Debug Test'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h3 className="font-medium text-gray-900">Test Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-gray-900">
                        {result.step}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.timestamp}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {result.message}
                    </div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Show details
                        </summary>
                        <pre className="text-xs bg-white/50 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          This component helps debug World ID verification issues.
        </div>
      </CardContent>
    </Card>
  )
}
