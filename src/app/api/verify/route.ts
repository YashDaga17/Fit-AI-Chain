import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse, ISuccessResult } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: ISuccessResult
  action: string
  signal: string | undefined
}

// Rate limiting for verification attempts
const verifyAttempts = new Map<string, { count: number, resetTime: number }>()
const VERIFY_RATE_LIMIT = 5 // attempts per window
const VERIFY_RATE_WINDOW = 15 * 60 * 1000 // 15 minutes

function isVerifyRateLimited(clientId: string): boolean {
  const now = Date.now()
  const clientData = verifyAttempts.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    verifyAttempts.set(clientId, { count: 1, resetTime: now + VERIFY_RATE_WINDOW })
    return false
  }
  
  if (clientData.count >= VERIFY_RATE_LIMIT) {
    return true
  }
  
  clientData.count++
  return false
}

// Input validation
function validateVerificationPayload(data: any): data is IRequestPayload {
  return (
    data &&
    typeof data === 'object' &&
    data.payload &&
    typeof data.action === 'string' &&
    data.action.length > 0 &&
    data.action.length < 100 &&
    (data.signal === undefined || (typeof data.signal === 'string' && data.signal.length < 100))
  )
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIP = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    if (isVerifyRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait before trying again.', status: 429 },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Input validation
    if (!validateVerificationPayload(body)) {
      return NextResponse.json(
        { error: 'Invalid verification payload', status: 400 },
        { status: 400 }
      )
    }

    const { payload, action, signal } = body
    const app_id = (process.env.APP_ID || process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID) as `app_${string}`
    
    if (!app_id) {
      return NextResponse.json(
        { error: 'App ID not configured', status: 500 },
        { status: 500 }
      )
    }

    // Verify the proof using MiniKit's cloud verification
    const verifyRes = (await verifyCloudProof(payload, app_id, action, signal)) as IVerifyResponse

    if (verifyRes.success) {
      // This is where you should perform backend actions if the verification succeeds
      // Such as, setting a user as "verified" in a database
      
      return NextResponse.json({ 
        verifyRes, 
        status: 200,
        verified: true,
        message: 'Verification successful'
      })
    } else {
      // This is where you should handle errors from the World ID /verify endpoint.
      // Usually these errors are due to a user having already verified.
      console.error('Verification failed:', verifyRes)
      
      return NextResponse.json({ 
        verifyRes, 
        status: 400,
        verified: false,
        error: 'Verification failed - user may have already verified'
      })
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error during verification', 
        status: 500,
        verified: false
      },
      { status: 500 }
    )
  }
}
