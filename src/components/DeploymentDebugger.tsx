"use client"

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function DeploymentDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      // Environment
      nodeEnv: process.env.NODE_ENV,
      appId: process.env.NEXT_PUBLIC_WLD_APP_ID,
      fallbackAppId: process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
      
      // Current location
      url: window.location.href,
      origin: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      
      // User agent
      userAgent: navigator.userAgent,
      isWorldAppUA: navigator.userAgent.toLowerCase().includes('worldapp'),
      isMiniKitUA: navigator.userAgent.toLowerCase().includes('minikit'),
      
      // MiniKit
      miniKitAvailable: typeof MiniKit !== 'undefined',
      miniKitInstalled: false,
      miniKitError: null as string | null,
      
      // Bridges
      worldAppBridge: typeof (window as any).WorldApp !== 'undefined',
      webKitBridge: typeof (window as any).webkit?.messageHandlers?.minikit !== 'undefined',
      
      // Deployment type
      isVercel: window.location.hostname.includes('vercel.app'),
      isNgrok: window.location.hostname.includes('ngrok'),
      isLocalhost: window.location.hostname.includes('localhost'),
    }
    
    // Test MiniKit installation
    try {
      if (info.appId) {
        MiniKit.install(info.appId)
        info.miniKitInstalled = MiniKit.isInstalled()
      } else {
        info.miniKitError = 'No App ID found'
      }
    } catch (error: any) {
      info.miniKitError = error.message
    }
    
    setDebugInfo(info)
  }, [])

  const getDomainIssues = () => {
    const issues = []
    
    if (debugInfo.isVercel && !debugInfo.miniKitInstalled) {
      issues.push('Vercel domain not added to World ID Developer Portal')
    }
    
    if (!debugInfo.appId && !debugInfo.fallbackAppId) {
      issues.push('Environment variables not set in Vercel')
    }
    
    if (debugInfo.protocol !== 'https:' && !debugInfo.isLocalhost) {
      issues.push('HTTPS required for World ID (Vercel should auto-provide this)')
    }
    
    return issues
  }

  if (Object.keys(debugInfo).length === 0) {
    return <div>Loading debug info...</div>
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🔍 World ID Deployment Debug</h1>
      
      {/* Environment Info */}
      <div className="bg-white p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">📊 Environment</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Node ENV: <code>{debugInfo.nodeEnv}</code></div>
          <div>App ID: <code className={debugInfo.appId ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.appId || 'Missing'}
          </code></div>
          <div>URL: <code>{debugInfo.url}</code></div>
          <div>Origin: <code>{debugInfo.origin}</code></div>
        </div>
      </div>

      {/* MiniKit Status */}
      <div className="bg-white p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">🔧 MiniKit Status</h2>
        <div className="space-y-2 text-sm">
          <div className={`p-2 rounded ${debugInfo.miniKitInstalled ? 'bg-green-100' : 'bg-red-100'}`}>
            MiniKit Installed: <strong>{debugInfo.miniKitInstalled ? '✅ Yes' : '❌ No'}</strong>
          </div>
          {debugInfo.miniKitError && (
            <div className="p-2 bg-red-100 rounded">
              Error: <code>{debugInfo.miniKitError}</code>
            </div>
          )}
        </div>
      </div>

      {/* Platform Detection */}
      <div className="bg-white p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">🌐 Platform Detection</h2>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className={`p-2 rounded ${debugInfo.isVercel ? 'bg-blue-100' : 'bg-gray-100'}`}>
            Vercel: {debugInfo.isVercel ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${debugInfo.isNgrok ? 'bg-green-100' : 'bg-gray-100'}`}>
            Ngrok: {debugInfo.isNgrok ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${debugInfo.isLocalhost ? 'bg-yellow-100' : 'bg-gray-100'}`}>
            Localhost: {debugInfo.isLocalhost ? '✅' : '❌'}
          </div>
        </div>
      </div>

      {/* Issues & Solutions */}
      <div className="bg-white p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">🚨 Issues Found</h2>
        {getDomainIssues().length > 0 ? (
          <ul className="space-y-2">
            {getDomainIssues().map((issue, i) => (
              <li key={i} className="p-2 bg-red-100 rounded text-sm">
                ❌ {issue}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-2 bg-green-100 rounded text-sm">
            ✅ No issues detected
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🔧 Fix for Vercel</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Go to <a href="https://developer.worldcoin.org/" className="text-blue-600 underline">World ID Developer Portal</a></li>
          <li>Navigate to your app: <code>app_be256001919f34e9e8409e34bb74456f</code></li>
          <li>Add your Vercel domain to "Allowed Origins": <code>{debugInfo.origin}</code></li>
          <li>Check environment variables in Vercel dashboard</li>
          <li>Verify "Mini App" checkbox is enabled in Developer Portal</li>
        </ol>
      </div>
    </div>
  )
}
