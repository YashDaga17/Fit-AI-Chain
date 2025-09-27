import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { getCategoryBonus } from '@/utils/levelingSystem'

// Try different environment variable names for Google API key
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

// Rate limiting - simple in-memory store (use Redis in production)
const requestCounts = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT = 10 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

function isRateLimited(clientId: string): boolean {
  const now = Date.now()
  const clientData = requestCounts.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }
  
  if (clientData.count >= RATE_LIMIT) {
    return true
  }
  
  clientData.count++
  return false
}

// Input validation
function validateImageInput(image: string): boolean {
  if (!image || typeof image !== 'string') return false
  if (!image.startsWith('data:image/')) return false
  if (image.length > 10 * 1024 * 1024) return false // 10MB limit
  return true
}

// Helper function for fallback response when AI fails
function getFailureFallback() {
  return NextResponse.json({
    success: true,
    food: 'Unknown Food Item',
    calories: 200,
    description: 'Could not analyze image with AI. Please enter calories manually.',
    confidence: 'low',
    cuisine: 'unknown',
    portionSize: 'estimated serving',
    ingredients: ['unknown'],
    cookingMethod: 'unknown',
    xp: 100,
    baseXP: 100,
    bonusMultiplier: 1.0,
    nutrients: {
      protein: '10g',
      carbs: '25g',
      fat: '8g',
      fiber: '3g',
      sugar: '5g'
    },
    healthScore: '5',
    allergens: [],
    alternatives: 'Upload a clearer image for better analysis'
  })
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIP = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { image, userId } = body

    // Input validation
    if (!validateImageInput(image)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image data provided' },
        { status: 400 }
      )
    }

    // Validate userId if provided
    if (userId && (typeof userId !== 'string' || userId.length > 100)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId provided' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    // Remove data URL prefix
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '')
    
    // Try different Gemini models in order of preference (updated for latest models)
    const modelNames = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision']
    
    let model
    let modelUsed = ''
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent results
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192, // Increased for more detailed responses
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        })
        modelUsed = modelName
        break
      } catch (modelError) {
        continue
      }
    }
    
    if (!model) {
      return NextResponse.json({
        success: false,
        error: 'No AI models available for image analysis'
      }, { status: 500 })
    }

    const prompt = `You are an advanced AI nutritionist and food recognition expert with access to comprehensive food databases and nutritional information from around the world. Analyze this food image with the following capabilities:

FOOD IDENTIFICATION REQUIREMENTS:
1. Identify the exact food name, including cultural/regional variations
2. Recognize ingredients, cooking methods, and preparation styles
3. Estimate portion size using visual cues (plates, utensils, hands for scale)
4. Identify food origin/cuisine type when relevant
5. Detect multiple food items if present in the image

NUTRITIONAL ANALYSIS:
- Provide accurate calorie estimation based on visible portion
- Include macronutrients (protein, carbs, fat, fiber)
- Consider cooking methods that affect calories (fried vs grilled)
- Account for hidden ingredients (oils, sauces, seasonings)

RESPONSE FORMAT: Return ONLY valid JSON with no additional text:
{
  "food": "specific food name with preparation method",
  "calories": estimated_calories_number,
  "description": "detailed nutritional and preparation description",
  "confidence": "high/medium/low",
  "cuisine": "cuisine type or origin if identifiable",
  "portionSize": "estimated portion size description",
  "ingredients": ["main ingredients visible"],
  "cookingMethod": "preparation method if visible",
  "nutrients": {
    "protein": "amount in grams",
    "carbs": "amount in grams", 
    "fat": "amount in grams",
    "fiber": "amount in grams",
    "sugar": "amount in grams if significant"
  },
  "healthScore": "rating from 1-10 based on nutritional value",
  "allergens": ["potential allergens"],
  "alternatives": "healthier preparation suggestions if applicable"
}

CALIBRATION EXAMPLES:
- Small apple (150g): 80 calories
- Pizza slice (pepperoni, regular): 285 calories
- Big Mac burger: 563 calories
- Caesar salad with dressing (300g): 320 calories
- Banana medium (120g): 105 calories
- White rice cooked (1 cup): 205 calories
- Grilled chicken breast (6oz): 350 calories
- Fried chicken thigh: 250 calories
- Chocolate chip cookie (medium): 220 calories
- Avocado toast (2 slices): 380 calories

ACCURACY FOCUS:
- Be precise with food names (e.g., "Pan-seared salmon fillet" not "fish")
- Consider regional variations (e.g., "New York style pizza" vs "Neapolitan pizza")
- Account for visible toppings, sauces, and sides
- Estimate realistic portions based on visual context`

    // Detect the image format from the original data URL
    let mimeType = 'image/jpeg'
    if (image.startsWith('data:image/png')) {
      mimeType = 'image/png'
    } else if (image.startsWith('data:image/webp')) {
      mimeType = 'image/webp'
    }
    
    let result
    try {
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ])
    } catch (geminiError: any) {      
      // Try with different MIME type as fallback
      if (mimeType !== 'image/jpeg') {
        try {
          result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
          ])
        } catch (retryError) {
          return getFailureFallback()
        }
      } else {
        return getFailureFallback()
      }
    }

    if (!result) {
      return getFailureFallback()
    }

    const response = result.response
    const text = response.text()

    // Try to extract JSON from the response
    let foodData
    try {
      // First try to parse the entire response as JSON
      foodData = JSON.parse(text.trim())
      
      // Validate the required fields
      if (!foodData.food || typeof foodData.calories !== 'number' || isNaN(foodData.calories)) {
        throw new Error('Invalid response format')
      }
    } catch (parseError) {
      // Try to extract JSON from the response text
      try {
        const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        if (jsonMatch) {
          foodData = JSON.parse(jsonMatch[0])
          
          // Validate the required fields
          if (!foodData.food || typeof foodData.calories !== 'number' || isNaN(foodData.calories)) {
            throw new Error('Invalid response format')
          }
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (secondParseError) {
        // Fallback parsing by extracting information manually
        foodData = {
          food: 'Unknown Food Item',
          calories: 250,
          description: 'Could not analyze the food image properly. Please try again.',
          confidence: 'low',
          cuisine: 'unknown',
          portionSize: 'estimated serving',
          ingredients: ['unknown'],
          cookingMethod: 'unknown',
          nutrients: {
            protein: '12g',
            carbs: '30g',
            fat: '10g',
            fiber: '4g',
            sugar: '6g'
          },
          healthScore: '5',
          allergens: [],
          alternatives: 'Please upload a clearer image for better analysis'
        }
      }
    }

    // Validate and sanitize the calories value
    const validCalories = typeof foodData.calories === 'number' && !isNaN(foodData.calories) && foodData.calories > 0 
      ? foodData.calories 
      : 200 // fallback to 200 calories if invalid

    // Calculate XP (half of calories + bonuses)
    let baseXP = Math.floor(validCalories / 2)
    const categoryBonus = getCategoryBonus(foodData.food)
    const finalXP = Math.floor(baseXP * categoryBonus)

    return NextResponse.json({
      success: true,
      food: foodData.food || 'Unknown Food Item',
      calories: validCalories,
      description: foodData.description,
      confidence: foodData.confidence || 'medium',
      cuisine: foodData.cuisine || 'unknown',
      portionSize: foodData.portionSize || 'standard serving',
      ingredients: foodData.ingredients || [],
      cookingMethod: foodData.cookingMethod || 'unknown',
      nutrients: foodData.nutrients || {
        protein: '8g',
        carbs: '25g',
        fat: '12g',
        fiber: '3g',
        sugar: '5g'
      },
      healthScore: foodData.healthScore || '5',
      allergens: foodData.allergens || [],
      alternatives: foodData.alternatives || '',
      xp: finalXP,
      baseXP: baseXP,
      bonusMultiplier: categoryBonus,
      modelUsed: modelUsed,
      timestamp: Date.now()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze food image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}