'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDailyTip, getRandomTip, type NutritionTip } from '@/utils/tipsAndInsights'
import { RefreshCw, Lightbulb } from 'lucide-react'

interface TipCardProps {
  showRefresh?: boolean
  className?: string
}

export default function TipCard({ showRefresh = true, className = '' }: TipCardProps) {
  const [tip, setTip] = useState<NutritionTip | null>(null)

  useEffect(() => {
    setTip(getDailyTip())
  }, [])

  const refreshTip = () => {
    setTip(getRandomTip())
  }

  if (!tip) return null

  return (
    <Card className={`border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-orange-800 text-sm font-medium">
            <Lightbulb className="w-4 h-4 mr-2 text-orange-600" />
            Daily Tip
          </CardTitle>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshTip}
              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start space-x-3">
          <span className="text-2xl" role="img" aria-label={tip.category}>
            {tip.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-orange-900 text-sm mb-1">
              {tip.title}
            </h4>
            <p className="text-orange-700 text-xs leading-relaxed">
              {tip.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
