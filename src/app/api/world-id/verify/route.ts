import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse, ISuccessResult } from '@worldcoin/minikit-js'

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = await req.json()

    if (!payload || !action) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID || process.env.APP_ID
    if (!app_id) {
      return NextResponse.json(
        { success: false, message: 'World ID not configured' },
        { status: 500 }
      )
    }

    // Ensure app_id has the correct format
    const formattedAppId = app_id.startsWith('app_') ? app_id : `app_${app_id}`

    // Verify the proof against World ID cloud
    const verifyRes = (await verifyCloudProof(
      payload as ISuccessResult,
      formattedAppId as `app_${string}`,
      action,
      signal || ''
    )) as IVerifyResponse

    if (verifyRes.success) {
      // Verification successful
      return NextResponse.json({
        success: true,
        verified: true,
        nullifier_hash: payload.nullifier_hash,
        verifyRes,
      })
    } else {
      // Verification failed
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: 'Proof verification failed',
          code: verifyRes.code,
          detail: verifyRes.detail,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Verification failed',
      },
      { status: 500 }
    )
  }
}
