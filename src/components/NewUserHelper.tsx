'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Trash2,
  RefreshCw
} from 'lucide-react'

interface UserData {
  verification: any
  stats: any
  entries: any[]
  preferences: any
}

export function NewUserHelper() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or if explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('show_debug_helper') === 'true'
    setIsVisible(shouldShow)
    
    if (shouldShow) {
      loadUserData()
    }
  }, [])

  const loadUserData = () => {
    try {
      const verification = localStorage.getItem('worldid_verification')
      const stats = localStorage.getItem('user_stats')
      const entries = localStorage.getItem('food_entries')
      const preferences = localStorage.getItem('user_preferences')

      setUserData({
        verification: verification ? JSON.parse(verification) : null,
        stats: stats ? JSON.parse(stats) : null,
        entries: entries ? JSON.parse(entries) : [],
        preferences: preferences ? JSON.parse(preferences) : null
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const clearAllData = () => {
    localStorage.removeItem('worldid_verification')
    localStorage.removeItem('user_stats')
    localStorage.removeItem('food_entries')
    localStorage.removeItem('user_preferences')
    loadUserData()
    console.log('All user data cleared')
  }

  const initializeNewUser = () => {
    // Initialize verification
    const guestVerification = {
      verified: true,
      timestamp: Date.now(),
      action: 'guest-access',
      verificationType: 'guest',
      nullifierHash: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      isGuest: true
    }
    localStorage.setItem('worldid_verification', JSON.stringify(guestVerification))

    // Initialize stats
    const defaultStats = {
      totalCalories: 0,
      totalXP: 0,
      streak: 1,
      level: 1,
      rank: 1,
      totalEntries: 0,
      joinedAt: Date.now(),
      lastVisit: Date.now()
    }
    localStorage.setItem('user_stats', JSON.stringify(defaultStats))

    // Initialize entries
    localStorage.setItem('food_entries', JSON.stringify([]))

    // Initialize preferences
    const defaultPrefs = {
      notifications: true,
      autoSync: true,
      theme: 'light',
      units: 'metric',
      createdAt: Date.now()
    }
    localStorage.setItem('user_preferences', JSON.stringify(defaultPrefs))

    loadUserData()
    console.log('New user data initialized')
  }

  const getStatusBadge = (hasData: boolean) => {
    return hasData ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Present
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Missing
      </Badge>
    )
  }

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto shadow-lg border-2 border-blue-200 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <User className="w-4 h-4 mr-2" />
          New User Helper
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto p-1 h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center">
              <Settings className="w-3 h-3 mr-1" />
              Verification
            </span>
            {getStatusBadge(!!userData?.verification)}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center">
              <Database className="w-3 h-3 mr-1" />
              Stats
            </span>
            {getStatusBadge(!!userData?.stats)}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center">
              <Database className="w-3 h-3 mr-1" />
              Entries ({userData?.entries?.length || 0})
            </span>
            {getStatusBadge(!!userData?.entries)}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center">
              <Settings className="w-3 h-3 mr-1" />
              Preferences
            </span>
            {getStatusBadge(!!userData?.preferences)}
          </div>
        </div>

        {userData?.verification && (
          <div className="bg-blue-50 rounded p-2 text-xs">
            <div><strong>Type:</strong> {userData.verification.verificationType || 'worldid'}</div>
            <div><strong>Expires:</strong> {userData.verification.expiresAt ? 
              new Date(userData.verification.expiresAt).toLocaleDateString() : 'Never'}</div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={initializeNewUser}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Init Guest
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 text-xs"
            onClick={clearAllData}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={loadUserData}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh Data
        </Button>
      </CardContent>
    </Card>
  )
}
