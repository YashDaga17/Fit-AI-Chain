'use client'

import { MiniKitProvider, WorldIDVerification } from '@/components/MiniKit'

export default function Home() {
  return (
    <MiniKitProvider>
      <WorldIDVerification />
    </MiniKitProvider>
  )
}
