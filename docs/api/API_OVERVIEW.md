# API Overview

This document provides an overview of all API routes used in Fit AI Chain.

---

# API Architecture

Fit AI Chain uses Next.js App Router API routes.

API routes are located in:

```text
src/app/api
```

The API layer handles:

- Authentication
- Food analysis
- User synchronization
- Leaderboard data
- Session handling

The API system is designed using modular route separation for scalability and maintainability.

---

# Core API Categories

| Category | Purpose |
|---|---|
| Authentication APIs | Wallet authentication and verification |
| Food Analysis APIs | AI-powered nutrition analysis |
| User APIs | User synchronization and profile management |
| Leaderboard APIs | XP rankings and leaderboard data |

---

# Authentication APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/nonce` | GET | Generate authentication nonce |
| `/api/complete-siwe` | POST | Verify SIWE signature |
| `/api/verify` | POST | Verify World ID proofs |

---

# Food Analysis APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/analyze-food` | POST | Analyze uploaded food image |
| `/api/food/log` | POST | Store food tracking entry |

Food analysis endpoints integrate with Google Gemini AI for nutrition estimation.

---

# User APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/user/sync` | POST | Synchronize user data |
| `/api/user/*` | Various | User management operations |

---

# Leaderboard APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/leaderboard-db` | GET | Fetch leaderboard rankings |

---

# Request Flow

```text
Frontend Request
  ↓
API Route
  ↓
Business Logic
  ↓
Database / AI Services
  ↓
JSON Response
```

---

# API Response Format

Typical API responses use JSON.

Example:

```json
{
  "success": true,
  "message": "Request completed successfully"
}
```

---

# Error Handling

The API system includes:

- Input validation
- Error handling
- Authentication checks
- Response status management

Graceful fallback handling is implemented for failed AI requests and authentication errors.

---

# Security Features

Security protections include:

- Session validation
- Request verification
- Environment variable protection
- Input sanitization

---

# Related Documentation

- [Authentication API](./AUTH_API.md)
- [Food Analysis API](./FOOD_ANALYSIS_API.md)
- [User API](./USER_API.md)
- [Leaderboard API](./LEADERBOARD_API.md)