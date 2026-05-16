# Food Analysis API

This document explains the AI-powered food analysis endpoints.

---

# Overview

The food analysis APIs process uploaded food images using Google Gemini AI and return nutrition estimates.

The system supports:

- Food detection
- Nutrition analysis
- XP calculation
- Food logging workflows

The AI analysis system is designed to provide fast nutrition estimation directly from food images.

---

# Primary Endpoint

## `/api/analyze-food`

### Method

```text
POST
```

---

# Purpose

Analyzes uploaded food images and generates nutrition information.

---

# Request Format

Example request:

```json
{
  "image": "base64_or_image_data"
}
```

---

# Example Response

```json
{
  "success": true,
  "food": {
    "name": "Chicken Salad",
    "calories": 420,
    "protein": 35,
    "carbs": 18,
    "fat": 20,
    "fiber": 6
  },
  "xpEarned": 210
}
```

---

# Workflow

```text
Image Upload
  ↓
API Route Receives Request
  ↓
Gemini AI Processes Image
  ↓
Nutrition Data Generated
  ↓
XP Calculated
  ↓
Database Updated
  ↓
Frontend Displays Results
```

---

# Nutrition Data Returned

The API may return:

- Food name
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Portion estimates
- Health scoring

The AI may also provide confidence estimates for detected foods.

---

# XP Integration

XP rewards are automatically calculated after successful analysis.

Possible bonuses:

- Healthy food bonus
- Streak bonus
- Meal category bonus

---

# Error Responses

## Invalid Image

```json
{
  "success": false,
  "error": "Invalid image format"
}
```

---

## AI Processing Failure

```json
{
  "success": false,
  "error": "AI analysis failed"
}
```

---

## Missing API Key

```json
{
  "success": false,
  "error": "GOOGLE_API_KEY missing"
}
```

---

# Performance Considerations

The AI analysis system is optimized for:

- Mobile uploads
- Fast response handling
- Efficient image processing
- Scalable API usage

The architecture supports future upgrades to additional AI nutrition models.

---

# Security Considerations

Security protections include:

- Request validation
- File size restrictions
- Secure API key storage
- Input sanitization

---

# Related Documentation

- [AI Flow](../architecture/AI_FLOW.md)
- [Gamification System](../features/GAMIFICATION.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)