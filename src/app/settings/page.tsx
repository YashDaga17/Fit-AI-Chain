'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Target, 
  User, 
  Bell, 
  Download, 
  Trash2,
  ArrowLeft,
  Save,
  Apple,
  LogOut
} from 'lucide-react'

interface UserPreferences {
  dailyCalorieGoal: number
  proteinGoal: number
  carbGoal: number
  fatGoal: number
  notifications: boolean
  userName: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreferences>({
    dailyCalorieGoal: 2000,
    proteinGoal: 150,
    carbGoal: 200,
    fatGoal: 65,
    notifications: true,
    userName: 'User'
  })
  const [isVerified, setIsVerified] = useState(false)
  const [foodLogs, setFoodLogs] = useState([])

  useEffect(() => {
    const verificationData = localStorage.getItem('worldid_verification')
    if (!verificationData) {
      router.push('/')
      return
    }
    setIsVerified(true)

    // Load preferences
    const savedPreferences = localStorage.getItem('user_preferences')
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }

    // Load food logs for export
    const savedLogs = localStorage.getItem('food_logs')
    if (savedLogs) {
      setFoodLogs(JSON.parse(savedLogs))
    }
  }, [router])

  const savePreferences = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences))
    alert('Settings saved successfully!')
  }

  const exportData = () => {
    const data = {
      preferences,
      foodLogs,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitai-chain-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your food logs? This action cannot be undone.')) {
      localStorage.removeItem('food_logs')
      localStorage.removeItem('user_preferences')
      setFoodLogs([])
      alert('All data cleared successfully!')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('worldid_verification')
    localStorage.removeItem('food_logs')
    localStorage.removeItem('user_preferences')
    router.push('/')
  }

  if (!isVerified) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/calories')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Settings
                </h1>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Goals Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Daily Goals</span>
            </CardTitle>
            <CardDescription>
              Set your daily nutritional targets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Daily Calorie Goal
                </label>
                <Input
                  type="number"
                  value={preferences.dailyCalorieGoal}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    dailyCalorieGoal: parseInt(e.target.value) || 0
                  }))}
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Protein Goal (g)
                </label>
                <Input
                  type="number"
                  value={preferences.proteinGoal}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    proteinGoal: parseInt(e.target.value) || 0
                  }))}
                  placeholder="150"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Carbohydrate Goal (g)
                </label>
                <Input
                  type="number"
                  value={preferences.carbGoal}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    carbGoal: parseInt(e.target.value) || 0
                  }))}
                  placeholder="200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fat Goal (g)
                </label>
                <Input
                  type="number"
                  value={preferences.fatGoal}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    fatGoal: parseInt(e.target.value) || 0
                  }))}
                  placeholder="65"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>
              Your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Display Name
              </label>
              <Input
                type="text"
                value={preferences.userName}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  userName: e.target.value
                }))}
                placeholder="Your name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Export or clear your food tracking data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={exportData}
                variant="outline"
                className="flex-1 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
              
              <Button
                onClick={clearAllData}
                variant="outline"
                className="flex-1 flex items-center space-x-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                <strong>Export Data:</strong> Download all your food logs and preferences as a JSON file.
              </p>
              <p>
                <strong>Clear All Data:</strong> Permanently delete all your food tracking data from this device.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Apple className="h-5 w-5" />
              <span>Statistics</span>
            </CardTitle>
            <CardDescription>
              Your food tracking overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{foodLogs.length}</div>
                <div className="text-sm text-gray-600">Total Food Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.ceil((Date.now() - Date.parse('2024-01-01')) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-600">Days Using App</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {foodLogs.length > 0 ? Math.round(foodLogs.length / 7) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Entries/Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={savePreferences}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
