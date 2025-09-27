'use client'

import { MiniKitProvider, WorldIDVerification } from '@/components/MiniKit'

export default function Home() {
  return (
    <MiniKitProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <WorldIDVerification />
      </div>
    </MiniKitProvider>
  )
}
