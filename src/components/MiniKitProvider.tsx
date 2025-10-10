'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize MiniKit
    MiniKit.install(process.env.NEXT_PUBLIC_WLD_APP_ID)
  }, [])

  return <>{children}</>
}
