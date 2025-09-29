# Fit AI Chain - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [API Endpoints](#api-endpoints)
5. [Utility Functions](#utility-functions)
6. [Types & Interfaces](#types--interfaces)
7. [Configuration](#configuration)
8. [Environment Setup](#environment-setup)
9. [Deployment](#deployment)
10. [Testing & Debugging](#testing--debugging)

## Project Overview

Fit AI Chain is a Next.js 15 application that combines AI-powered food analysis with blockchain verification through World ID. The app allows users to track their food intake, earn XP points, level up their nutrition skills, and compete on leaderboards.

### Tech Stack
- **Framework**: Next.js 15 with Turbo
- **UI**: React 19, Tailwind CSS 4, Radix UI
- **Authentication**: World ID (Worldcoin)
- **AI**: Google Generative AI (Gemini)
- **State Management**: React Hooks + localStorage
- **Deployment**: Vercel
- **Language**: TypeScript

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page with World ID verification
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── globals.css        # Global styles
│   ├── tracker/           # Food tracking interface
│   ├── leaderboard/       # Competition rankings
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Shared utilities
├── types/                 # TypeScript definitions
└── utils/                 # Business logic utilities
```

## Core Components

### 1. Main Application (`src/app/page.tsx`)

**Purpose**: Entry point that renders World ID verification and debugging components.

```tsx
export default function Home() {
  return (
    <MiniKitProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <WorldIDVerification />
        <ProductionDebugger />
      </div>
    </MiniKitProvider>
  )
}
```

**Key Features**:
- Wraps the app in `MiniKitProvider` for World ID integration
- Provides gradient background styling
- Includes production debugging capabilities

### 2. MiniKit Provider (`src/components/MiniKit.tsx`)

**Purpose**: Core World ID integration component that handles authentication and app lifecycle.

#### Main Functions:

##### `MiniKitProvider`
```tsx
export function MiniKitProvider({ children }: { children: React.ReactNode })
```
- **Purpose**: Initializes MiniKit SDK and provides context to child components
- **Features**:
  - Environment validation
  - SDK initialization with error handling
  - App lifecycle management (ready state tracking)
  - Production and development mode support

##### `WorldIDVerification`
```tsx
export function WorldIDVerification()
```
- **Purpose**: Main UI component for World ID verification flow
- **State Management**:
  - `isVerified`: Boolean tracking verification status
  - `isVerifying`: Loading state during verification
  - `verificationData`: Stored verification response
  - `error`: Error state for failed verifications

**Verification Flow**:
1. Check localStorage for existing verification
2. Display verification UI if not verified
3. Handle verification button click
4. Send verification request to backend
5. Store successful verification data
6. Navigate to tracker page

##### `handleVerification`
```tsx
const handleVerification = async () => {
  // 1. Start loading state
  setIsVerifying(true)
  setError(null)
  
  // 2. Request verification from MiniKit
  const payload = await verify({ action: "verify-human", signal: "" })
  
  // 3. Send to backend for validation
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  // 4. Handle response and store data
  const result = await response.json()
  if (result.success) {
    localStorage.setItem('worldid_verification', JSON.stringify(result.data))
    setIsVerified(true)
  }
}
```

### 3. Food Tracker (`src/app/tracker/page.tsx`)

**Purpose**: Main food tracking interface with AI analysis, XP system, and progress tracking.

#### Core State Management:

```tsx
interface FoodEntry {
  id: string
  image: string
  food: string
  calories: number
  timestamp: number
  xp: number
  confidence?: string
  cuisine?: string
  portionSize?: string
  ingredients?: string[]
  cookingMethod?: string
  nutrients?: {
    protein: string
    carbs: string
    fat: string
    fiber: string
    sugar?: string
  }
  healthScore?: string
  allergens?: string[]
  alternatives?: string
}

interface UserStats {
  totalCalories: number
  totalXP: number
  streak: number
  level: number
  rank: number
}
```

#### Key Functions:

##### `handleImageUpload`
```tsx
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
      analyzeFood(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}
```
- **Purpose**: Handles file selection and converts to base64 for AI analysis
- **Process**: File → FileReader → base64 → AI analysis

##### `analyzeFood`
```tsx
const analyzeFood = async (imageData: string) => {
  setIsAnalyzing(true)
  
  try {
    const response = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: imageData,
        userId: getUserId()
      }),
    })

    const result = await response.json()
    
    if (result.success) {
      // Apply streak multiplier to XP
      const streakMultiplier = calculateStreakMultiplier(userStats.streak || 1)
      const finalXP = Math.floor(result.xp * streakMultiplier)
      
      // Create new food entry
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        image: imageData,
        food: result.food,
        calories: result.calories,
        timestamp: Date.now(),
        xp: finalXP,
        // ... additional properties from AI analysis
      }
      
      // Update state and localStorage
      setFoodEntries(prev => [newEntry, ...prev])
      updateUserStats(result.calories, finalXP)
    }
  } catch (error) {
    console.error('Food analysis failed:', error)
  } finally {
    setIsAnalyzing(false)
  }
}
```

##### `updateUserStats`
```tsx
const updateUserStats = (calories: number, xp: number) => {
  const newStats = {
    ...userStats,
    totalCalories: userStats.totalCalories + calories,
    totalXP: userStats.totalXP + xp,
    streak: calculateNewStreak(foodEntries),
    level: getUserLevel(userStats.totalXP + xp).level
  }
  
  setUserStats(newStats)
  localStorage.setItem('user_stats', JSON.stringify(newStats))
  
  // Save to backend
  saveFoodLog(newStats)
}
```

### 4. Production Debugger (`src/components/ProductionDebugger.tsx`)

**Purpose**: Development and production debugging interface for environment validation and API testing.

#### Key Features:

##### Environment Detection
```tsx
const getEnvironmentInfo = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
    domain: window.location.hostname,
    protocol: window.location.protocol,
    isVercel: window.location.hostname.includes('vercel.app'),
    isLocalhost: window.location.hostname === 'localhost',
    isNgrok: window.location.hostname.includes('ngrok'),
  }
}
```

##### API Testing
```tsx
const testWorldIDAPI = async () => {
  try {
    const testPayload = {
      proof: "test_proof",
      merkle_root: "test_root",
      nullifier_hash: "test_nullifier",
      verification_level: "device"
    }
    
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    })
    
    const result = await response.json()
    setApiTestResult(result)
  } catch (error) {
    setApiTestResult({ error: error.message })
  }
}
```

### 5. Leaderboard (`src/app/leaderboard/page.tsx`)

**Purpose**: Displays user rankings and competition metrics.

#### Core Features:
- User ranking display
- XP-based sorting
- Achievement showcase
- Weekly/monthly competitions

## API Endpoints

### 1. Food Analysis API (`src/app/api/analyze-food/route.ts`)

**Purpose**: AI-powered food recognition and nutritional analysis using Google Gemini.

#### Main Function:
```tsx
export async function POST(request: Request) {
  try {
    const { image, userId } = await request.json()
    
    // Validate inputs
    if (!image || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    // Prepare image for analysis
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "")
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    }
    
    // Create detailed prompt for food analysis
    const prompt = `Analyze this food image and provide detailed nutrition information in JSON format...`
    
    // Generate AI response
    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()
    
    // Parse and validate AI response
    const analysis = JSON.parse(text)
    
    // Calculate XP based on food healthiness and portion
    const baseXP = calculateFoodXP(analysis)
    
    return NextResponse.json({
      success: true,
      food: analysis.food_name,
      calories: analysis.calories,
      xp: baseXP,
      // ... additional analysis data
    })
    
  } catch (error) {
    console.error('Food analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
```

#### XP Calculation:
```tsx
function calculateFoodXP(analysis: any): number {
  let baseXP = 10 // Base XP for any food entry
  
  // Bonus for healthy foods
  if (analysis.health_score >= 8) baseXP += 15
  else if (analysis.health_score >= 6) baseXP += 10
  else if (analysis.health_score >= 4) baseXP += 5
  
  // Bonus for proper portion size
  if (analysis.portion_size === 'appropriate') baseXP += 5
  
  // Bonus for cooking method
  if (['grilled', 'steamed', 'baked'].includes(analysis.cooking_method)) {
    baseXP += 5
  }
  
  return baseXP
}
```

### 2. World ID Verification API (`src/app/api/verify/route.ts`)

**Purpose**: Backend verification of World ID proofs using Worldcoin's verification service.

#### CORS Helper:
```tsx
function addCORSHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}
```

#### Main Verification:
```tsx
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { proof, merkle_root, nullifier_hash, verification_level } = body
    
    // Environment-specific handling
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isTestRequest = body.test === true
    
    // Handle test requests in development
    if (isDevelopment && isTestRequest) {
      const testResponse = NextResponse.json({
        success: true,
        code: "success",
        detail: "Test verification successful",
        data: { nullifier_hash: "test_nullifier" }
      })
      return addCORSHeaders(testResponse)
    }
    
    // Production World ID verification
    const verifyResponse = await fetch('https://developer.worldcoin.org/api/v1/verify/app_staging_1234567890abcdef', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nullifier_hash,
        merkle_root,
        proof,
        verification_level,
        action: process.env.WLD_ACTION || "verify-human",
        signal: ""
      })
    })
    
    const verifyResult = await verifyResponse.json()
    
    if (verifyResult.success) {
      const successResponse = NextResponse.json({
        success: true,
        code: verifyResult.code,
        data: { nullifier_hash }
      })
      return addCORSHeaders(successResponse)
    } else {
      const errorResponse = NextResponse.json(
        { success: false, code: verifyResult.code, detail: verifyResult.detail },
        { status: 400 }
      )
      return addCORSHeaders(errorResponse)
    }
    
  } catch (error) {
    console.error('Verification error:', error)
    const errorResponse = NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
    return addCORSHeaders(errorResponse)
  }
}
```

### 3. Food Logs API (`src/app/api/food-logs/route.ts`)

**Purpose**: CRUD operations for food tracking data.

#### GET - Retrieve User Logs:
```tsx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }
  
  // In a real app, this would query a database
  // For now, we return mock data or handle client-side storage
  return NextResponse.json({ success: true, logs: [] })
}
```

#### POST - Save Food Log:
```tsx
export async function POST(request: Request) {
  try {
    const { userId, foodEntry, userStats } = await request.json()
    
    // Validate required fields
    if (!userId || !foodEntry) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }
    
    // In production, save to database
    // For now, acknowledge the save
    return NextResponse.json({ success: true, message: 'Food log saved' })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save food log' }, { status: 500 })
  }
}
```

### 4. Leaderboard API (`src/app/api/leaderboard/route.ts`)

**Purpose**: Retrieve and manage user rankings.

## Utility Functions

### 1. Leveling System (`src/utils/levelingSystem.ts`)

**Purpose**: Comprehensive XP and achievement system for user progression.

#### Core Data Structure:
```tsx
export interface UserLevel {
  level: number
  title: string
  description: string
  minXP: number
  maxXP: number
  badge: string
}

export const FOOD_TRACKING_LEVELS: UserLevel[] = [
  {
    level: 1,
    title: "Calorie Curious",
    description: "Just starting your food tracking journey",
    minXP: 0,
    maxXP: 499,
    badge: "🌱"
  },
  // ... 10 levels total
]
```

#### Key Functions:

##### `getUserLevel(totalXP: number): UserLevel`
```tsx
export function getUserLevel(totalXP: number): UserLevel {
  const validXP = Number(totalXP) || 0
  
  for (const level of FOOD_TRACKING_LEVELS) {
    if (validXP >= level.minXP && validXP <= level.maxXP) {
      return level
    }
  }
  return FOOD_TRACKING_LEVELS[FOOD_TRACKING_LEVELS.length - 1]
}
```
- **Purpose**: Determines user's current level based on total XP
- **Input**: Total XP accumulated by user
- **Output**: UserLevel object with title, badge, and XP range
- **Edge Cases**: Handles invalid/null XP values, returns max level for overflow

##### `getXPProgress(totalXP: number)`
```tsx
export function getXPProgress(totalXP: number): {
  currentLevel: UserLevel
  nextLevel: UserLevel | null
  progressXP: number
  neededXP: number
  progressPercentage: number
} {
  const currentLevel = getUserLevel(totalXP)
  const nextLevel = getNextLevel(currentLevel.level)
  
  const progressXP = totalXP - currentLevel.minXP
  const levelXPRange = currentLevel.maxXP - currentLevel.minXP
  const neededXP = nextLevel ? nextLevel.minXP - totalXP : 0
  const progressPercentage = (progressXP / levelXPRange) * 100
  
  return {
    currentLevel,
    nextLevel,
    progressXP,
    neededXP,
    progressPercentage: Math.min(progressPercentage, 100)
  }
}
```
- **Purpose**: Calculates detailed progress information for UI display
- **Returns**: Complete progress data including percentages and XP requirements

##### `calculateStreakMultiplier(streak: number): number`
```tsx
export function calculateStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0  // 1 month streak: 2x XP
  if (streak >= 14) return 1.7  // 2 week streak: 1.7x XP
  if (streak >= 7) return 1.5   // 1 week streak: 1.5x XP
  if (streak >= 3) return 1.2   // 3 day streak: 1.2x XP
  return 1.0 // No bonus
}
```
- **Purpose**: Rewards consistent daily usage with XP multipliers
- **Tiers**: 3-day (1.2x), 7-day (1.5x), 14-day (1.7x), 30-day (2.0x)

##### `getAchievements(totalXP: number, streak: number, totalEntries: number): string[]`
```tsx
export function getAchievements(totalXP: number, streak: number, totalEntries: number): string[] {
  const achievements: string[] = []
  
  // XP-based achievements
  if (totalXP >= 1000) achievements.push("🏆 First Thousand")
  if (totalXP >= 10000) achievements.push("💎 XP Diamond")
  if (totalXP >= 50000) achievements.push("⭐ XP Superstar")
  
  // Streak-based achievements
  if (streak >= 7) achievements.push("🔥 Week Warrior")
  if (streak >= 30) achievements.push("📅 Month Master")
  if (streak >= 100) achievements.push("💪 Century Champion")
  
  // Entry-based achievements
  if (totalEntries >= 50) achievements.push("📸 Snap Master")
  if (totalEntries >= 200) achievements.push("🎯 Tracking Pro")
  if (totalEntries >= 1000) achievements.push("🚀 Calorie Legend")
  
  return achievements
}
```
- **Purpose**: Unlocks achievement badges based on user milestones
- **Categories**: XP milestones, streak achievements, entry count achievements

##### `getCategoryBonus(foodName: string): number`
```tsx
export function getCategoryBonus(foodName: string): number {
  const lowerFood = foodName.toLowerCase()
  
  if (lowerFood.includes('salad') || lowerFood.includes('vegetable') || lowerFood.includes('fruit')) {
    return 1.2 // 20% bonus for healthy foods
  }
  if (lowerFood.includes('grilled') || lowerFood.includes('steamed') || lowerFood.includes('baked')) {
    return 1.1 // 10% bonus for healthy cooking methods
  }
  
  return 1.0 // No bonus
}
```
- **Purpose**: Provides XP bonuses for healthy food choices
- **Logic**: Text matching for food types and cooking methods

### 2. Date Utilities (`src/utils/dateUtils.ts`)

**Purpose**: Comprehensive date formatting and manipulation for food tracking timestamps.

#### Key Functions:

##### `formatTimestamp(timestamp: number): string`
```tsx
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
```
- **Purpose**: Human-readable relative time formatting
- **Output**: "Just now", "5m ago", "2h ago", "3d ago", or absolute date

##### `getDateRangeString(startDate: Date, endDate: Date): string`
```tsx
export function getDateRangeString(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  
  if (start === end) return start
  return `${start} - ${end}`
}
```

##### `isToday(timestamp: number): boolean`
```tsx
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp)
  const today = new Date()
  
  return date.toDateString() === today.toDateString()
}
```

##### `getWeekStart(date: Date): Date`
```tsx
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}
```

### 3. Nutrition Utilities (`src/utils/nutritionUtils.ts`)

**Purpose**: Nutritional analysis, calorie calculations, and health scoring.

#### Key Functions:

##### `calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number`
```tsx
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  // Mifflin-St Jeor Equation
  const baseMetabolism = (10 * weight) + (6.25 * height) - (5 * age)
  
  if (gender === 'male') {
    return baseMetabolism + 5
  } else {
    return baseMetabolism - 161
  }
}
```
- **Purpose**: Calculates Basal Metabolic Rate using Mifflin-St Jeor equation
- **Inputs**: Weight (kg), height (cm), age (years), gender
- **Output**: Daily calories needed for basic body functions

##### `calculateTDEE(bmr: number, activityLevel: string): number`
```tsx
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725,
    'extremely_active': 1.9
  }
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2
  return Math.round(bmr * multiplier)
}
```
- **Purpose**: Calculates Total Daily Energy Expenditure
- **Logic**: BMR × activity multiplier

##### `analyzeNutritionalBalance(nutrients: NutrientData): HealthAnalysis`
```tsx
export function analyzeNutritionalBalance(nutrients: NutrientData): HealthAnalysis {
  const { protein, carbs, fat, fiber, sugar } = nutrients
  
  const totalMacros = protein + carbs + fat
  const proteinPercent = (protein / totalMacros) * 100
  const carbsPercent = (carbs / totalMacros) * 100
  const fatPercent = (fat / totalMacros) * 100
  
  let score = 0
  const recommendations: string[] = []
  
  // Protein analysis (10-35% recommended)
  if (proteinPercent >= 10 && proteinPercent <= 35) {
    score += 25
  } else if (proteinPercent < 10) {
    recommendations.push("Consider adding more protein sources")
    score += 10
  } else {
    recommendations.push("Protein intake might be too high")
    score += 15
  }
  
  // Carbohydrate analysis (45-65% recommended)
  if (carbsPercent >= 45 && carbsPercent <= 65) {
    score += 25
  } else {
    recommendations.push("Balance your carbohydrate intake")
    score += 10
  }
  
  // Fat analysis (20-35% recommended)
  if (fatPercent >= 20 && fatPercent <= 35) {
    score += 25
  } else {
    recommendations.push("Adjust fat intake for optimal health")
    score += 10
  }
  
  // Fiber bonus
  if (fiber >= 25) {
    score += 25
    recommendations.push("Great fiber intake!")
  } else {
    recommendations.push("Add more fiber-rich foods")
    score += 5
  }
  
  return {
    score: Math.min(score, 100),
    grade: getHealthGrade(score),
    recommendations,
    macroBreakdown: { proteinPercent, carbsPercent, fatPercent }
  }
}
```

##### `getHealthGrade(score: number): string`
```tsx
export function getHealthGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}
```

### 4. Tips and Insights (`src/utils/tipsAndInsights.ts`)

**Purpose**: Personalized nutrition advice and motivational content based on user data.

#### Key Functions:

##### `getPersonalizedTip(userLevel: number, streak: number, recentFoods: string[]): string`
```tsx
export function getPersonalizedTip(userLevel: number, streak: number, recentFoods: string[]): string {
  const tips = {
    beginner: [
      "Try to include a vegetable with every meal for extra nutrients!",
      "Drinking water before meals can help with portion control.",
      "Aim for colorful plates - different colors mean different nutrients!"
    ],
    intermediate: [
      "Consider meal prepping on weekends to maintain consistency.",
      "Try the 80/20 rule: eat healthy 80% of the time, enjoy treats 20%.",
      "Pay attention to how different foods make you feel after eating."
    ],
    advanced: [
      "Experiment with nutrient timing around your workouts.",
      "Consider tracking micronutrients like iron, B12, and vitamin D.",
      "Try intermittent fasting or time-restricted eating if it fits your lifestyle."
    ]
  }
  
  let category = 'beginner'
  if (userLevel >= 5) category = 'intermediate'
  if (userLevel >= 8) category = 'advanced'
  
  const categoryTips = tips[category as keyof typeof tips]
  return categoryTips[Math.floor(Math.random() * categoryTips.length)]
}
```

##### `generateStreakMotivation(streak: number): string`
```tsx
export function generateStreakMotivation(streak: number): string {
  if (streak >= 30) {
    return "🔥 Amazing! You're on a month-long streak! You're developing incredible healthy habits!"
  } else if (streak >= 14) {
    return "💪 Two weeks strong! Your consistency is paying off. Keep it up!"
  } else if (streak >= 7) {
    return "⭐ One week streak! You're building momentum. Stay focused!"
  } else if (streak >= 3) {
    return "🌟 Great start! Three days in a row. Keep the momentum going!"
  } else {
    return "🚀 Every journey starts with a single step. You've got this!"
  }
}
```

##### `getFoodInsight(foodName: string, nutritionData: any): string`
```tsx
export function getFoodInsight(foodName: string, nutritionData: any): string {
  const insights = {
    'apple': "Apples are rich in fiber and antioxidants. The saying 'an apple a day keeps the doctor away' has scientific backing!",
    'salmon': "Salmon is an excellent source of omega-3 fatty acids, which support heart and brain health.",
    'broccoli': "Broccoli is a nutritional powerhouse with vitamin C, vitamin K, and cancer-fighting compounds.",
    'oats': "Oats contain beta-glucan fiber, which can help lower cholesterol and keep you full longer.",
    // Add more insights...
  }
  
  const specificInsight = insights[foodName.toLowerCase() as keyof typeof insights]
  if (specificInsight) return specificInsight
  
  // Generate generic insight based on nutrition data
  if (nutritionData.protein > 20) {
    return "This food is high in protein, great for muscle building and satiety!"
  } else if (nutritionData.fiber > 5) {
    return "Rich in fiber! This will help with digestion and keeping you full."
  } else if (nutritionData.healthScore > 8) {
    return "Excellent choice! This food has a high health score."
  }
  
  return "Remember, variety is key to a balanced diet. Great job tracking your food!"
}
```

### 5. Image Utilities (`src/utils/imageUtils.ts`)

**Purpose**: Image processing, compression, and validation for food photos.

#### Key Functions:

##### `compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string>`
```tsx
export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedDataUrl)
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
```
- **Purpose**: Reduces image file size while maintaining quality for faster uploads
- **Parameters**: File object, max width, JPEG quality (0-1)
- **Output**: Base64 data URL of compressed image

##### `validateImageFile(file: File): { valid: boolean; error?: string }`
```tsx
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' }
  }
  
  return { valid: true }
}
```

##### `extractImageMetadata(file: File): Promise<ImageMetadata>`
```tsx
export function extractImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const metadata: ImageMetadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name,
        lastModified: new Date(file.lastModified)
      }
      resolve(metadata)
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
```

### 6. Common Foods Database (`src/utils/commonFoods.ts`)

**Purpose**: Pre-defined nutritional database for common foods to enhance AI analysis accuracy.

#### Data Structure:
```tsx
export const commonFoods = [
  {
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    serving: '1 medium (182g)'
  },
  {
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving: '100g cooked'
  },
  // ... more foods
]
```

#### Helper Functions:

##### `findMatchingFood(foodName: string): FoodData | null`
```tsx
export function findMatchingFood(foodName: string): FoodData | null {
  const normalized = foodName.toLowerCase()
  
  return commonFoods.find(food => 
    food.name.toLowerCase().includes(normalized) ||
    normalized.includes(food.name.toLowerCase())
  ) || null
}
```

##### `searchFoodsByCategory(category: string): FoodData[]`
```tsx
export function searchFoodsByCategory(category: string): FoodData[] {
  const categories = {
    'fruits': ['apple', 'banana', 'orange'],
    'vegetables': ['broccoli', 'carrots', 'spinach'],
    'proteins': ['chicken', 'salmon', 'eggs'],
    'grains': ['rice', 'oats', 'bread'],
    'dairy': ['yogurt', 'milk', 'cheese'],
    'nuts': ['almonds', 'peanut', 'walnuts']
  }
  
  const categoryFoods = categories[category.toLowerCase() as keyof typeof categories] || []
  
  return commonFoods.filter(food =>
    categoryFoods.some(cat => food.name.toLowerCase().includes(cat))
  )
}
```

### 7. Environment Validation (`src/utils/environmentValidation.ts`)

**Purpose**: Robust environment variable validation for different deployment contexts.

#### Core Functions:

##### `validateEnvironment(): EnvironmentValidation`
```tsx
export function validateEnvironment(): EnvironmentValidation {
  const validation: EnvironmentValidation = {
    isValid: true,
    missingVars: [],
    warnings: [],
    environment: getEnvironmentType()
  }
  
  // Check required environment variables
  const requiredVars = [
    { names: ['GOOGLE_AI_API_KEY', 'NEXT_PUBLIC_GOOGLE_AI_API_KEY'], description: 'Google AI API key for food analysis' },
    { names: ['WLD_APP_ID', 'NEXT_PUBLIC_WLD_APP_ID'], description: 'World ID app identifier' },
    { names: ['WLD_ACTION', 'NEXT_PUBLIC_WLD_ACTION'], description: 'World ID action name' }
  ]
  
  for (const varGroup of requiredVars) {
    const hasAnyVar = varGroup.names.some(name => 
      process.env[name] || (typeof window !== 'undefined' && (window as any).process?.env?.[name])
    )
    
    if (!hasAnyVar) {
      validation.isValid = false
      validation.missingVars.push({
        names: varGroup.names,
        description: varGroup.description
      })
    }
  }
  
  // Add warnings for development
  if (validation.environment === 'development') {
    validation.warnings.push('Running in development mode - some features may behave differently')
  }
  
  return validation
}
```

##### `getEnvironmentType(): 'development' | 'production' | 'preview'`
```tsx
export function getEnvironmentType(): 'development' | 'production' | 'preview' {
  if (typeof window !== 'undefined') {
    // Client-side detection
    const hostname = window.location.hostname
    
    if (hostname === 'localhost' || hostname.includes('ngrok')) {
      return 'development'
    } else if (hostname.includes('vercel.app') && !hostname.includes('-git-')) {
      return 'production'
    } else if (hostname.includes('vercel.app')) {
      return 'preview'
    }
  }
  
  // Server-side detection
  const nodeEnv = process.env.NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV
  
  if (vercelEnv === 'production') return 'production'
  if (vercelEnv === 'preview') return 'preview'
  if (nodeEnv === 'development') return 'development'
  
  return 'production' // Default fallback
}
```

##### `validateClientEnvironment(): boolean`
```tsx
export function validateClientEnvironment(): boolean {
  if (typeof window === 'undefined') return true // Server-side is OK
  
  try {
    // Check for required client-side capabilities
    const hasLocalStorage = typeof localStorage !== 'undefined'
    const hasFileReader = typeof FileReader !== 'undefined'
    const hasCanvas = typeof HTMLCanvasElement !== 'undefined'
    
    if (!hasLocalStorage) {
      console.warn('localStorage not available - data persistence disabled')
      return false
    }
    
    if (!hasFileReader) {
      console.error('FileReader API not available - image upload disabled')
      return false
    }
    
    if (!hasCanvas) {
      console.warn('Canvas API not available - image compression disabled')
    }
    
    return true
  } catch (error) {
    console.error('Client environment validation failed:', error)
    return false
  }
}
```

### 8. MiniKit Utilities (`src/utils/minikit.ts`)

**Purpose**: World ID and MiniKit SDK integration utilities.

#### Key Functions:

##### `initializeMiniKit(): Promise<boolean>`
```tsx
export async function initializeMiniKit(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      console.log('MiniKit: Server-side, skipping initialization')
      return false
    }
    
    const { MiniKit } = await import('@worldcoin/minikit-js')
    
    const isValidEnvironment = validateMiniKitEnvironment()
    if (!isValidEnvironment) {
      console.warn('MiniKit: Invalid environment, using development mode')
    }
    
    await MiniKit.install({
      appId: process.env.NEXT_PUBLIC_WLD_APP_ID || 'app_staging_default',
      enableDebugMode: process.env.NODE_ENV === 'development'
    })
    
    console.log('MiniKit initialized successfully')
    return true
    
  } catch (error) {
    console.error('MiniKit initialization failed:', error)
    return false
  }
}
```

##### `validateMiniKitEnvironment(): boolean`
```tsx
export function validateMiniKitEnvironment(): boolean {
  const requiredVars = [
    'NEXT_PUBLIC_WLD_APP_ID',
    'NEXT_PUBLIC_WLD_ACTION'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.warn('Missing MiniKit environment variables:', missing)
    return false
  }
  
  return true
}
```

##### `createVerificationPayload(nullifierHash: string, proof: string): VerificationPayload`
```tsx
export function createVerificationPayload(nullifierHash: string, proof: string): VerificationPayload {
  return {
    nullifier_hash: nullifierHash,
    merkle_root: extractMerkleRoot(proof),
    proof: proof,
    verification_level: 'orb',
    action: process.env.NEXT_PUBLIC_WLD_ACTION || 'verify-human',
    signal: ''
  }
}
```

## Types & Interfaces

### 1. Core Types (`src/types/index.ts`)

**Purpose**: Central type definitions for the entire application.

#### Main Interfaces:

##### `FoodEntry`
```tsx
export interface FoodEntry {
  id: string
  image: string
  food: string
  calories: number
  timestamp: number
  xp: number
  confidence?: string
  cuisine?: string
  portionSize?: string
  ingredients?: string[]
  cookingMethod?: string
  nutrients?: NutrientData
  healthScore?: string
  allergens?: string[]
  alternatives?: string
}
```

##### `NutrientData`
```tsx
export interface NutrientData {
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  vitamins?: {
    [key: string]: number
  }
  minerals?: {
    [key: string]: number
  }
}
```

##### `UserStats`
```tsx
export interface UserStats {
  totalCalories: number
  totalXP: number
  streak: number
  level: number
  rank: number
  totalEntries?: number
  averageHealthScore?: number
  favoriteFood?: string
  weeklyGoal?: number
  monthlyGoal?: number
}
```

##### `VerificationResult`
```tsx
export interface VerificationResult {
  success: boolean
  code?: string
  detail?: string
  data?: {
    nullifier_hash: string
    verification_level?: string
  }
  error?: string
}
```

##### `AIAnalysisResult`
```tsx
export interface AIAnalysisResult {
  success: boolean
  food: string
  calories: number
  xp: number
  confidence: string
  cuisine?: string
  portionSize?: string
  ingredients?: string[]
  cookingMethod?: string
  nutrients?: NutrientData
  healthScore?: number
  allergens?: string[]
  alternatives?: string[]
  tips?: string[]
  error?: string
}
```

### 2. Extended Types (`src/types/index-new.ts`)

**Purpose**: Additional type definitions for new features and components.

#### Additional Interfaces:

##### `LeaderboardEntry`
```tsx
export interface LeaderboardEntry {
  id: string
  username: string
  totalXP: number
  level: number
  streak: number
  rank: number
  avatar?: string
  achievements: string[]
  weeklyXP: number
  monthlyXP: number
}
```

##### `Achievement`
```tsx
export interface Achievement {
  id: string
  name: string
  description: string
  badge: string
  requirement: {
    type: 'xp' | 'streak' | 'entries' | 'food_type'
    value: number | string
  }
  unlockedAt?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}
```

##### `DailyChallenge`
```tsx
export interface DailyChallenge {
  id: string
  date: string
  title: string
  description: string
  type: 'food_type' | 'calorie_target' | 'health_score' | 'streak'
  target: number | string
  reward: {
    xp: number
    badge?: string
  }
  progress: number
  completed: boolean
}
```

## Configuration

### 1. Next.js Configuration (`next.config.ts`)

**Purpose**: Next.js build configuration with CORS, security headers, and environment optimization.

```tsx
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_WLD_APP_ID: process.env.NEXT_PUBLIC_WLD_APP_ID,
    NEXT_PUBLIC_WLD_ACTION: process.env.NEXT_PUBLIC_WLD_ACTION,
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
  },
  
  // Security and CORS headers
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://worldcoin.org https://*.worldcoin.org",
            ].join('; '),
          },
        ],
      },
    ]
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
```

### 2. TypeScript Configuration (`tsconfig.json`)

**Purpose**: TypeScript compiler configuration for type safety and modern JavaScript features.

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Tailwind Configuration (`tailwind.config.js`)

**Purpose**: Tailwind CSS configuration for design system and styling.

```js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-scale': 'pulseScale 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

## Environment Setup

### Required Environment Variables

#### Production Variables:
```env
# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# World ID Configuration
WLD_APP_ID=app_staging_1234567890abcdef
NEXT_PUBLIC_WLD_APP_ID=app_staging_1234567890abcdef
WLD_ACTION=verify-human
NEXT_PUBLIC_WLD_ACTION=verify-human

# Deployment Configuration
VERCEL_ENV=production
NEXT_PUBLIC_VERCEL_ENV=production
```

#### Development Variables:
```env
# Same as production, but with staging/test values
WLD_APP_ID=app_staging_test123
NEXT_PUBLIC_WLD_APP_ID=app_staging_test123

# Development flags
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Environment Validation Process:

1. **Server-side validation**: `validateEnvironment()` checks for required variables
2. **Client-side validation**: `validateClientEnvironment()` checks browser capabilities
3. **Runtime validation**: Components validate environment on mount
4. **Fallback handling**: Graceful degradation when variables are missing

## Deployment

### Vercel Deployment Script (`deploy-vercel.sh`)

```bash
#!/bin/bash

echo "🚀 Starting Vercel deployment for Fit AI Chain..."

# Environment validation
if [ -z "$GOOGLE_AI_API_KEY" ]; then
    echo "❌ Missing GOOGLE_AI_API_KEY environment variable"
    exit 1
fi

if [ -z "$WLD_APP_ID" ]; then
    echo "❌ Missing WLD_APP_ID environment variable"
    exit 1
fi

# Build validation
echo "🔧 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi

echo "🔧 Running build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod --confirm

echo "✅ Deployment complete!"
echo "🌍 Visit your app: https://fit-ai-chain.vercel.app"
```

### Deployment Checklist:

1. **Environment Variables**: Set all required variables in Vercel dashboard
2. **Domain Configuration**: Configure custom domain if needed
3. **CORS Settings**: Ensure API endpoints have proper CORS headers
4. **Build Optimization**: Enable Turbo build for faster deployments
5. **Error Monitoring**: Set up error tracking and logging
6. **Performance Monitoring**: Monitor Core Web Vitals

## Testing & Debugging

### Production Debugger Component

The `ProductionDebugger` component provides comprehensive debugging capabilities:

#### Features:
- **Environment Detection**: Shows current environment (development/production/preview)
- **API Testing**: Test World ID verification endpoint
- **Configuration Display**: Shows current environment variables (safely)
- **Error Logging**: Displays recent errors and warnings
- **Performance Metrics**: Basic performance information

#### Usage:
```tsx
// Only shown in development or when debug flag is set
{(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG) && (
  <ProductionDebugger />
)}
```

### Common Debugging Scenarios:

#### 1. World ID Verification Issues:
```tsx
// Check environment variables
console.log('WLD_APP_ID:', process.env.NEXT_PUBLIC_WLD_APP_ID)
console.log('WLD_ACTION:', process.env.NEXT_PUBLIC_WLD_ACTION)

// Test verification endpoint
const testPayload = {
  proof: "test_proof",
  merkle_root: "test_root",
  nullifier_hash: "test_nullifier",
  verification_level: "orb"
}

fetch('/api/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload)
})
```

#### 2. AI Analysis Issues:
```tsx
// Check Google AI configuration
console.log('Google AI Key configured:', !!process.env.GOOGLE_AI_API_KEY)

// Test food analysis
fetch('/api/analyze-food', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,test_data',
    userId: 'test_user'
  })
})
```

#### 3. LocalStorage Issues:
```tsx
// Check localStorage availability
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
  console.log('localStorage available')
} catch (error) {
  console.error('localStorage not available:', error)
}
```

### Error Handling Patterns:

#### 1. Component Error Boundaries:
```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo)
    // In production, send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }

    return this.props.children
  }
}
```

#### 2. Async Error Handling:
```tsx
async function safeApiCall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API call failed: ${url}`, error)
    
    // Return safe fallback
    return { success: false, error: error.message }
  }
}
```

#### 3. State Management Error Handling:
```tsx
const [error, setError] = useState<string | null>(null)

const handleError = (error: Error | string) => {
  const message = typeof error === 'string' ? error : error.message
  setError(message)
  
  // Clear error after timeout
  setTimeout(() => setError(null), 5000)
}
```

## Performance Optimization

### 1. Image Optimization:
- Automatic compression using Canvas API
- Progressive JPEG loading
- Lazy loading for food entries
- Image caching in localStorage

### 2. Code Splitting:
- Dynamic imports for heavy components
- Route-based code splitting
- Lazy loading of utility functions

### 3. State Management:
- Efficient localStorage operations
- Debounced API calls
- Optimistic UI updates
- Minimal re-renders with proper dependency arrays

### 4. API Optimization:
- Request deduplication
- Response caching
- Error retry logic
- Timeout handling

## Security Considerations

### 1. Environment Variables:
- Sensitive keys only on server-side
- Client-side variables prefixed with `NEXT_PUBLIC_`
- Production/development environment separation

### 2. API Security:
- CORS headers for cross-origin requests
- Input validation and sanitization
- Rate limiting considerations
- Error message sanitization

### 3. World ID Integration:
- Proper verification flow
- Nullifier hash handling
- Proof validation on backend
- Secure token storage

This comprehensive technical documentation covers every aspect of the Fit AI Chain application, from individual functions to architectural decisions. Each component, utility, and configuration has been explained with its purpose, implementation details, and usage patterns to help developers understand and maintain the codebase effectively.
