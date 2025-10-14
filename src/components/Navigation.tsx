"use client"

import { useRouter, usePathname } from 'next/navigation'
import { Home, Trophy, Camera, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { 
      href: '/', 
      label: 'Home', 
      icon: Home,
      active: pathname === '/'
    },
    { 
      href: '/tracker', 
      label: 'Food Tracker', 
      icon: Camera,
      active: pathname === '/tracker'
    },
    { 
      href: '/leaderboard', 
      label: 'Leaderboard', 
      icon: Trophy,
      active: pathname === '/leaderboard'
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-50">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant={item.active ? "default" : "ghost"}
                size="sm"
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  item.active 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
