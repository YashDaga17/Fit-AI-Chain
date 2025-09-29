import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse, ISuccessResult } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: ISuccessResult
  action: string
  signal: string | undefined
}

// CORS helper function
function createCorsResponse(data: any, status: number = 200, request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'https://worldapp.org',
    'https://fit-ai-chain.vercel.app',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ]

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
  } else if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*'
  }

  return NextResponse.json(data, { status, headers })
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

function isTestRequest(data: any): boolean {
  return data && typeof data === 'object' && data.test === true
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight for World App
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'https://worldapp.org',
    'https://fit-ai-chain.vercel.app',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ]
  
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIP = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Enhanced logging for production debugging
    console.log('Verification request from IP:', clientIP)
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasAppId: !!(process.env.APP_ID || 
                  process.env.NEXT_PUBLIC_WLD_APP_ID || 
                  process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID ||
                  process.env.WLD_APP_ID),
      hasPublicAppId: !!(process.env.NEXT_PUBLIC_WLD_APP_ID || 
                        process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID),
      appIdFormat: (process.env.APP_ID || 
                   process.env.NEXT_PUBLIC_WLD_APP_ID || 
                   process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID ||
                   process.env.WLD_APP_ID)?.substring(0, 4),
    })
    
    if (isVerifyRateLimited(clientIP)) {
      console.log('Rate limited IP:', clientIP)
      return createCorsResponse(
        { error: 'Too many verification attempts. Please wait before trying again.', status: 429 },
        429,
        request
      )
    }

    const body = await request.json()
    console.log('Verification payload received:', {
      hasPayload: !!body.payload,
      action: body.action,
      signal: body.signal,
      payloadKeys: body.payload ? Object.keys(body.payload) : [],
      isTestRequest: isTestRequest(body)
    })
    
    // Handle test requests (for debugging/health checks)
    if (isTestRequest(body)) {
      console.log('Test request received')
      return createCorsResponse(
        { 
          error: 'Invalid verification payload - test request detected', 
          status: 400,
          message: 'API endpoint is working. Send proper World ID verification payload.',
          expectedFormat: {
            payload: 'ISuccessResult from MiniKit',
            action: 'string',
            signal: 'string (optional)'
          }
        },
        400,
        request
      )
    }
    
    if (!validateVerificationPayload(body)) {
      console.error('Invalid verification payload structure:', body)
      return createCorsResponse(
        { 
          error: 'Invalid verification payload', 
          status: 400,
          expectedFormat: {
            payload: 'ISuccessResult from MiniKit',
            action: 'string',
            signal: 'string (optional)'
          }
        },
        400,
        request
      )
    }

    const { payload, action, signal } = body
    const app_id = (process.env.APP_ID || 
                    process.env.NEXT_PUBLIC_WLD_APP_ID || 
                    process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID ||
                    process.env.WLD_APP_ID) as `app_${string}`
    
    if (!app_id) {
      console.error('App ID not configured - check environment variables')
      return createCorsResponse(
        { error: 'App ID not configured', status: 500 },
        500,
        request
      )
    }

    // Validate app_id format
    if (!app_id.startsWith('app_')) {
      console.error('Invalid app_id format:', app_id.substring(0, 10) + '...')
      return createCorsResponse(
        { error: 'Invalid app ID format', status: 500 },
        500,
        request
      )
    }

    console.log('Attempting verification with:', {
      app_id: app_id.substring(0, 10) + '...',
      action,
      signal: signal ? 'present' : 'empty',
      nullifier_hash: payload.nullifier_hash ? 'present' : 'missing'
    })

    // Verify the proof using MiniKit's cloud verification
    const verifyRes = (await verifyCloudProof(payload, app_id, action, signal)) as IVerifyResponse

    if (verifyRes.success) {
      console.log('Verification successful for nullifier:', payload.nullifier_hash?.substring(0, 10) + '...')
      
      return createCorsResponse({ 
        verifyRes, 
        status: 200,
        verified: true,
        message: 'Verification successful'
      }, 200, request)
    } else {
      console.error('Verification failed:', {
        success: verifyRes.success,
        code: verifyRes.code,
        detail: verifyRes.detail,
        attribute: verifyRes.attribute
      })
      
      return createCorsResponse({ 
        verifyRes, 
        status: 400,
        verified: false,
        error: verifyRes.detail || 'Verification failed - user may have already verified'
      }, 400, request)
    }
  } catch (error) {
    console.error('Verification error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      NODE_ENV: process.env.NODE_ENV
    })
    return createCorsResponse(
      { 
        error: 'Internal server error during verification', 
        status: 500,
        verified: false,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      500,
      request
    )
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'https://worldapp.org',
    'https://fit-ai-chain.vercel.app',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ]

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
  } else if (process.env.NODE_ENV === 'development') {
    corsHeaders['Access-Control-Allow-Origin'] = '*'
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}
