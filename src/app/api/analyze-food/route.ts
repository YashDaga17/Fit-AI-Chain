import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface FoodAnalysis {
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

export async function POST(req: NextRequest) {
  try {
    const { image, userId, sessionToken } = await req.json()
    
    if (!image || !userId || !sessionToken) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    // Convert base64 image to the format expected by Gemini
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Analyze this food image and provide a detailed nutritional breakdown. Be as accurate as possible and provide the smallest/most conservative calorie estimate to help users with their fitness goals.

For each food item visible in the image, provide:
1. Food name and identification
2. Estimated weight in grams (be conservative/realistic)
3. Calories per 100g (use standard nutritional databases)
4. Total calories for the estimated portion
5. Macronutrients (protein, carbs, fat, fiber, sugar, sodium in grams/mg)
6. Your confidence level (0-100%)
7. Data source (where you got the nutritional information)
8. Any notes about your analysis

Format your response as a JSON object with this exact structure:
{
  "foods": [
    {
      "food_name": "specific food name",
      "estimated_weight_grams": number,
      "calories_per_100g": number,
      "total_calories": number,
      "protein": number,
      "carbohydrates": number,
      "fat": number,
      "fiber": number,
      "sugar": number,
      "sodium": number,
      "confidence": number,
      "serving_size": "description of portion",
      "data_source": "USDA/nutrition database reference",
      "analysis_notes": "brief explanation of estimation"
    }
  ],
  "total_calories": number,
  "analysis_confidence": number,
  "general_notes": "overall analysis notes"
}

Provide conservative estimates to help users stay within their calorie goals. If unsure, estimate lower rather than higher.`

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    let analysisData
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text)
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to analyze image. Please try again with a clearer photo.",
          debug: text.slice(0, 500)
        },
        { status: 500 }
      )
    }

    // Validate and format the response
    if (!analysisData.foods || !Array.isArray(analysisData.foods)) {
      return NextResponse.json(
        { success: false, message: "Invalid analysis format received" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error analyzing food:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to analyze food image"
      },
      { status: 500 }
    )
  }
}