import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = await req.json() as IRequestPayload

    // TODO: Retrieve the reference from your database
    // const reference = await getReferenceFromDB()

    // Verify the transaction with Developer Portal API
    const app_id = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || 'app_86f9f548ff3e656a673692a02440cddf'
    
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${app_id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to verify transaction'
      }, { status: 400 })
    }

    const transaction = await response.json()

    // Verify transaction details match
    // You should also verify the reference matches what you stored
    if (transaction.status !== 'failed') {
      // TODO: Update your database to mark payment as successful
      
      return NextResponse.json({ 
        success: true,
        transaction
      })
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Transaction failed'
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to confirm payment' 
    }, { status: 500 })
  }
}
