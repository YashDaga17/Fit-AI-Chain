'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Plus, 
  Target, 
  PieChart, 
  CheckCircle, 
  ArrowRight,
  Smartphone,
  Zap,
  TrendingUp
} from 'lucide-react'

export default function GettingStartedGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    {
      id: 1,
      title: 'Take Your First Food Photo',
      description: 'Use our AI-powered camera to analyze your meal instantly',
      icon: Camera,
      color: 'blue',
      action: 'Take Photo'
    },
    {
      id: 2,
      title: 'Try Quick Add',
      description: 'Add common foods quickly from our database',
      icon: Plus,
      color: 'green',
      action: 'Quick Add'
    },
    {
      id: 3,
      title: 'Set Your Goals',
      description: 'Customize your daily calorie and macro targets',
      icon: Target,
      color: 'purple',
      action: 'Go to Settings'
    },
    {
      id: 4,
      title: 'View Your Progress',
      description: 'Check your weekly summary and insights',
      icon: PieChart,
      color: 'orange',
      action: 'View Summary'
    }
  ]

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const progress = (completedSteps.length / steps.length) * 100

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
              Getting Started with FitAI Chain
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Complete these steps to get the most out of your calorie tracking journey
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {completedSteps.length}/{steps.length}
            </div>
            <p className="text-xs text-gray-500">completed</p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id)
          const IconComponent = step.icon
          
          return (
            <div
              key={step.id}
              className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                isCompleted 
                  ? 'bg-green-100 text-green-600' 
                  : `bg-${step.color}-100 text-${step.color}-600`
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${
                  isCompleted ? 'text-green-800' : 'text-gray-800'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-xs mt-0.5 ${
                  isCompleted ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    Done
                  </Badge>
                )}
                <Button
                  variant={isCompleted ? "ghost" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => toggleStep(step.id)}
                >
                  {isCompleted ? 'Undo' : step.action}
                  {!isCompleted && <ArrowRight className="w-3 h-3 ml-1" />}
                </Button>
              </div>
            </div>
          )
        })}
        
        {completedSteps.length === steps.length && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-800 text-sm">Congratulations! 🎉</h4>
                <p className="text-green-700 text-xs">
                  You're all set up! Keep logging your food to build healthy habits and reach your goals.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
