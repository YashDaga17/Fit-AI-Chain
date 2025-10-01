'use client'

import { MiniKitProvider, WorldIDVerification } from '@/components/SimpleMiniKit'

export default function Home() {
  return (
    <MiniKitProvider>
      <WorldIDVerification />
    </MiniKitProvider>
  )
}
