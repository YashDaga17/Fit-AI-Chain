'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import TipCard from '@/components/TipCard'
import { commonFoods } from '@/utils/commonFoods'
import { 
  Camera, 
  Upload, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock,
  Trash2,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Calendar,
  Apple,
  BarChart3,
  X,
  Plus,
  Search
} from 'lucide-react'

interface FoodItem {
  food_name: string
  estimated_weight_grams: number
  calories_per_100g: number
  total_calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  confidence: number
  serving_size: string
  data_source: string
  analysis_notes: string
}

interface FoodAnalysis {
  foods: FoodItem[]
  total_calories: number
  analysis_confidence: number
  general_notes: string
}

interface FoodLog {
  id: string
  timestamp: string
  image: string
  analysis: FoodAnalysis
}

export default function CalorieTracker() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // State management
  const [isVerified, setIsVerified] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [dailyGoal, setDailyGoal] = useState(2000) // Default daily calorie goal
  const [proteinGoal, setProteinGoal] = useState(150)
  const [carbGoal, setCarbGoal] = useState(200) 
  const [fatGoal, setFatGoal] = useState(65)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<FoodLog | null>(null)
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [foodSearch, setFoodSearch] = useState('')

  // Calculate daily totals
  const today = new Date().toDateString()
  const todaysLogs = foodLogs.filter(log => new Date(log.timestamp).toDateString() === today)
  const dailyCalories = todaysLogs.reduce((total, log) => total + log.analysis.total_calories, 0)
  
  // Calculate macronutrients from all foods in today's logs
  let dailyProtein = 0, dailyCarbs = 0, dailyFat = 0
  todaysLogs.forEach(log => {
    log.analysis.foods.forEach(food => {
      dailyProtein += food.protein
      dailyCarbs += food.carbohydrates
      dailyFat += food.fat
    })
  })

  // Check verification status on component mount
  useEffect(() => {
    const verificationData = localStorage.getItem('worldid_verification')
    if (verificationData) {
      try {
        const userData = JSON.parse(verificationData)
        setUserInfo(userData)
        setIsVerified(true)
        
        // Load saved food logs
        const savedLogs = localStorage.getItem('food_logs')
        if (savedLogs) {
          setFoodLogs(JSON.parse(savedLogs))
        }

        // Load user preferences
        const savedPreferences = localStorage.getItem('user_preferences')
        if (savedPreferences) {
          const prefs = JSON.parse(savedPreferences)
          setDailyGoal(prefs.dailyCalorieGoal || 2000)
          setProteinGoal(prefs.proteinGoal || 150)
          setCarbGoal(prefs.carbGoal || 200)
          setFatGoal(prefs.fatGoal || 65)
        }
      } catch (error) {
        console.error('Error parsing verification data:', error)
        redirectToHome()
      }
    } else {
      redirectToHome()
    }
  }, [])

  const redirectToHome = () => {
    router.push('/')
  }

  // Save food logs to localStorage whenever they change
  useEffect(() => {
    if (foodLogs.length > 0) {
      localStorage.setItem('food_logs', JSON.stringify(foodLogs))
    }
  }, [foodLogs])

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
      setShowCamera(true)
      setError(null)
    } catch (err) {
      setError('Unable to access camera. Please check permissions or try uploading an image instead.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        stopCamera()
        analyzeFood(imageData)
      }
    }
  }

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        analyzeFood(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  // Analyze food with Gemini API
  const analyzeFood = async (imageData: string) => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageData,
          userId: userInfo?.proof || 'anonymous',
          sessionToken: 'session_token'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.analysis) {
        const newLog: FoodLog = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          image: imageData,
          analysis: result.analysis
        }
        
        setFoodLogs(prev => [newLog, ...prev])
        setSelectedLog(newLog)
        setShowAnalysisDialog(true)
      } else {
        throw new Error(result.message || 'Analysis failed')
      }
    } catch (error) {
      console.error('Food analysis error:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze food. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Delete a food log
  const deleteLog = (id: string) => {
    const updatedLogs = foodLogs.filter(log => log.id !== id)
    setFoodLogs(updatedLogs)
    localStorage.setItem('food_logs', JSON.stringify(updatedLogs))
  }

  // Quick add common food
  const quickAddFood = (food: any) => {
    const newLog: FoodLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      image: '',
      analysis: {
        foods: [{
          food_name: food.name,
          estimated_weight_grams: 0,
          calories_per_100g: 0,
          total_calories: food.calories,
          protein: food.protein,
          carbohydrates: food.carbs,
          fat: food.fat,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          confidence: 1,
          serving_size: food.serving,
          data_source: 'USDA Database',
          analysis_notes: 'Added from common foods database'
        }],
        total_calories: food.calories,
        analysis_confidence: 1,
        general_notes: `Added ${food.name} from quick-add database`
      }
    }
    
    setFoodLogs(prev => [newLog, ...prev])
    setShowQuickAdd(false)
    setFoodSearch('')
  }

  const filteredFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(foodSearch.toLowerCase())
  )

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('worldid_verification')
    localStorage.removeItem('food_logs')
    router.push('/')
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Verifying your World ID...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Apple className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FitAI Chain
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    World ID Verified
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Daily Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Zap className="h-5 w-5" />
                <span>Calories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{Math.round(dailyCalories)}</div>
              <div className="text-blue-100 text-sm">of {dailyGoal} goal</div>
              <Progress 
                value={(dailyCalories / dailyGoal) * 100} 
                className="mt-2 bg-blue-600"
              />
              {dailyCalories > dailyGoal && (
                <div className="text-blue-100 text-xs mt-1">Over goal by {Math.round(dailyCalories - dailyGoal)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span>Protein</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1 text-green-600">{Math.round(dailyProtein)}</div>
              <div className="text-gray-600 text-sm">of {proteinGoal}g goal</div>
              <Progress 
                value={(dailyProtein / proteinGoal) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg text-orange-600">
                <BarChart3 className="h-5 w-5" />
                <span>Carbs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1 text-orange-600">{Math.round(dailyCarbs)}</div>
              <div className="text-gray-600 text-sm">of {carbGoal}g goal</div>
              <Progress 
                value={(dailyCarbs / carbGoal) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg text-purple-600">
                <Target className="h-5 w-5" />
                <span>Fat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1 text-purple-600">{Math.round(dailyFat)}</div>
              <div className="text-gray-600 text-sm">of {fatGoal}g goal</div>
              <Progress 
                value={(dailyFat / fatGoal) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Daily Tip */}
        <TipCard className="mb-6" />

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Add Food Entry</span>
            </CardTitle>
            <CardDescription>
              Analyze your food with AI-powered image recognition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={startCamera}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
                disabled={isAnalyzing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowQuickAdd(true)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Capture Food Photo</h3>
                <Button variant="ghost" size="sm" onClick={stopCamera}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera} className="flex-1">
                  Cancel
                </Button>
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        )}

        {/* Food Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Food History</span>
            </CardTitle>
            <CardDescription>
              Your recent food entries and nutritional analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {foodLogs.length === 0 ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Apple className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Calorie Journey!</h3>
                  <p className="text-gray-600 mb-6">No food entries yet. Here's how to get started:</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Camera className="h-8 w-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-800 mb-1">Take Photos</h4>
                    <p className="text-blue-700 text-sm">Use AI-powered food recognition to automatically analyze your meals with detailed nutritional breakdown.</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Plus className="h-8 w-8 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-800 mb-1">Quick Add</h4>
                    <p className="text-green-700 text-sm">Instantly add common foods from our database without taking photos.</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <Zap className="h-8 w-8 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-purple-800 mb-1">Smart Analysis</h4>
                    <p className="text-purple-700 text-sm">Get detailed nutritional information with confidence scores and conservative estimates.</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                    <h4 className="font-semibold text-orange-800 mb-1">Track Daily Progress</h4>
                    <p className="text-orange-700 text-sm">Monitor your calorie and macronutrient intake with real-time progress bars.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {foodLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log)
                      setShowAnalysisDialog(true)
                    }}
                  >
                    <img
                      src={log.image}
                      alt="Food"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">
                          {log.analysis.foods.map(f => f.food_name).join(', ')}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(log.analysis.analysis_confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(log.timestamp).toLocaleDateString()} at{' '}
                        {new Date(log.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Calories</div>
                          <div className="font-semibold text-blue-600">
                            {Math.round(log.analysis.total_calories)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Protein</div>
                          <div className="font-semibold text-green-600">
                            {Math.round(log.analysis.foods.reduce((sum, f) => sum + f.protein, 0))}g
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Carbs</div>
                          <div className="font-semibold text-orange-600">
                            {Math.round(log.analysis.foods.reduce((sum, f) => sum + f.carbohydrates, 0))}g
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Fat</div>
                          <div className="font-semibold text-purple-600">
                            {Math.round(log.analysis.foods.reduce((sum, f) => sum + f.fat, 0))}g
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteLog(log.id)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Add Food</DialogTitle>
            <DialogDescription>
              Add common foods to your daily log instantly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search foods..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {filteredFoods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => quickAddFood(food)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{food.name}</h4>
                    <p className="text-sm text-gray-600">{food.serving}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{food.calories} cal</div>
                    <div className="text-xs text-gray-500">
                      P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                    </div>
                  </div>
                </div>
              ))}
              {filteredFoods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Apple className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No foods found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analysis Detail Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Food Analysis Details</DialogTitle>
            <DialogDescription>
              AI-powered nutritional analysis with conservative estimates
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <img
                src={selectedLog.image}
                alt="Analyzed food"
                className="w-full h-48 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(selectedLog.analysis.total_calories)}
                  </div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(selectedLog.analysis.foods.reduce((sum, f) => sum + f.protein, 0))}g
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(selectedLog.analysis.foods.reduce((sum, f) => sum + f.carbohydrates, 0))}g
                  </div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(selectedLog.analysis.foods.reduce((sum, f) => sum + f.fat, 0))}g
                  </div>
                  <div className="text-sm text-gray-600">Fat</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Detected Foods</span>
                </h3>
                <div className="space-y-4">
                  {selectedLog.analysis.foods.map((food, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">{food.food_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(food.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Serving:</span> {food.serving_size}
                        </div>
                        <div>
                          <span className="text-gray-500">Weight:</span> {food.estimated_weight_grams}g
                        </div>
                        <div>
                          <span className="text-gray-500">Calories/100g:</span> {food.calories_per_100g}
                        </div>
                        <div>
                          <span className="text-gray-500">Total Calories:</span> {Math.round(food.total_calories)}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Protein:</span> {food.protein.toFixed(1)}g
                        </div>
                        <div>
                          <span className="text-gray-500">Carbs:</span> {food.carbohydrates.toFixed(1)}g
                        </div>
                        <div>
                          <span className="text-gray-500">Fat:</span> {food.fat.toFixed(1)}g
                        </div>
                        <div>
                          <span className="text-gray-500">Fiber:</span> {food.fiber.toFixed(1)}g
                        </div>
                        <div>
                          <span className="text-gray-500">Sugar:</span> {food.sugar.toFixed(1)}g
                        </div>
                        <div>
                          <span className="text-gray-500">Sodium:</span> {food.sodium.toFixed(0)}mg
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div><span className="font-medium">Data Source:</span> {food.data_source}</div>
                        <div><span className="font-medium">Notes:</span> {food.analysis_notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Analysis Notes</span>
                </h4>
                <p className="text-blue-700 text-sm">{selectedLog.analysis.general_notes}</p>
                <p className="text-blue-600 text-xs mt-2">
                  Overall Analysis Confidence: {Math.round(selectedLog.analysis.analysis_confidence * 100)}%
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
