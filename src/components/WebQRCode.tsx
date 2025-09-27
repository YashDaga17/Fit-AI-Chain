'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, ExternalLink, Copy, Check } from 'lucide-react'

export function WebQRCode() {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const url = window.location.href
      setCurrentUrl(url)
      // Generate QR code using a simple API service
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`)
    }
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openInWorldApp = () => {
    // Try to open in World App if on mobile
    const worldAppUrl = `https://worldapp.org/verification?app_id=${process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID}&redirect_uri=${encodeURIComponent(currentUrl)}`
    window.open(worldAppUrl, '_blank')
  }

  if (!mounted || !currentUrl || !qrCodeUrl) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-orange-200 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🍎</div>
          <p className="text-orange-600">Loading QR Code...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-8 border-orange-200 shadow-lg">
      <CardHeader className="text-center pb-4">
        <Smartphone className="w-12 h-12 mx-auto text-orange-600 mb-2" />
        <CardTitle className="text-xl text-orange-900">
          Open in World App
        </CardTitle>
        <p className="text-orange-700 text-sm">
          Scan this QR code with your phone to open in the World App
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
            <img
              src={qrCodeUrl}
              alt="QR Code to open in World App"
              className="w-48 h-48"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2">How to verify:</h4>
          <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
            <li>Open the World App on your phone</li>
            <li>Scan this QR code or open the link below</li>
            <li>Complete the verification process</li>
            <li>Start tracking your calories!</li>
          </ol>
        </div>

        {/* Manual link option */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Or copy this link to your phone:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50"
            />
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="outline"
              className="px-3"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Try World App button */}
        <Button
          onClick={openInWorldApp}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Try Opening in World App
        </Button>

        <p className="text-xs text-gray-500 text-center">
          World ID verification is required to ensure each person can only create one account.
        </p>
      </CardContent>
    </Card>
  )
}
