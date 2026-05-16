# AI Analysis Flow

This document explains how AI-powered food analysis works in Fit AI Chain.

---

# AI Technology Stack

Fit AI Chain uses:

- Google Gemini AI
- Next.js API routes
- Image upload processing
- Nutrition analysis workflows

---

# AI Workflow Overview

The AI system analyzes uploaded food images and generates nutrition information automatically.

The workflow includes:

- Image upload
- AI image processing
- Food detection
- Nutrition estimation
- XP calculation
- Database storage

---

# AI Flow Diagram

```text
User Uploads Food Image
  ↓
Frontend Sends Image
  ↓
API Route Receives Request
  ↓
Gemini AI Processes Image
  ↓
Nutrition Data Generated
  ↓
XP Calculated
  ↓
Results Stored in Database
  ↓
Frontend Displays Results
```

---

# Step-by-Step Workflow

## 1. Food Image Upload

The user uploads or captures a food image using the tracker interface.

Supported workflows:

- Mobile camera capture
- Local image upload

---

## 2. API Request Processing

The frontend sends the image to the AI analysis API route.

Primary endpoint:

```text
/api/analyze-food
```

---

## 3. Gemini AI Analysis

Google Gemini AI analyzes:

- Food type
- Ingredients
- Portion size
- Macronutrients
- Estimated calories

The AI system may also provide confidence scoring for analysis accuracy.

---

## 4. Nutrition Data Generation

The system generates:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Additional nutrition details

---

## 5. XP Calculation

XP rewards are calculated using food nutrition information and gamification logic.

Possible bonuses include:

- Healthy food bonus
- Streak multiplier
- Category rewards

---

## 6. Database Storage

The analyzed food entry is stored in the database.

Stored information includes:

- Food name
- Nutrition values
- XP earned
- Linked image
- Timestamp

---

# AI Features

Current AI capabilities include:

- Multi-food detection
- Portion estimation
- Cuisine recognition
- Allergen identification
- Health scoring
- Nutrition analysis

The system can also suggest healthier alternatives for certain meals.

---

# API Integration

Primary AI endpoint:

| Route | Purpose |
|---|---|
| `/api/analyze-food` | Food image analysis |

---

# Performance Considerations

The AI system is optimized for:

- Fast image processing
- Mobile uploads
- Scalable API requests
- Efficient storage handling

The architecture is designed to support future AI model upgrades and additional nutrition features.

---

# Common AI Issues

## Poor Detection Accuracy

- Use clearer images
- Improve lighting
- Avoid blurry photos

## AI Request Failure

- Verify `GOOGLE_API_KEY`
- Check Gemini API quota
- Verify API permissions

## Upload Problems

- Check image format support
- Verify request size limits
- Ensure stable internet connection

---

# Related Documentation

- [Food Analysis API](../api/FOOD_ANALYSIS_API.md)
- [Gamification System](../features/GAMIFICATION.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)