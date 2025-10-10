import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { type MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload

    const cookieStore = await cookies()
    const storedNonce = cookieStore.get('siwe')?.value

    if (nonce !== storedNonce) {
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid nonce',
      }, { status: 400 })
    }

    // Verify the SIWE message signature
    const validMessage = await verifySiweMessage(payload, nonce)
    
    if (!validMessage.isValid) {
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid signature',
      }, { status: 400 })
    }
    
    // Return success - we don't return address, frontend gets username from MiniKit
    return NextResponse.json({
      status: 'success',
      isValid: true,
    })
  } catch (error: any) {
    console.error('SIWE verification error:', error)
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: error.message || 'Verification failed',
    }, { status: 500 })
  }
}
