# User API

This document explains user-related API routes in Fit AI Chain.

---

# Overview

The User API handles:

- User synchronization
- Profile management
- XP tracking
- User session linking
- Progression updates

The User API helps maintain consistent user progression across authentication sessions.

---

# Primary Endpoints

## `/api/user/sync`

### Method

```text
POST
```

### Purpose

Synchronizes authenticated users with the database.

This endpoint:

- Creates users if they do not exist
- Updates existing user data
- Links authentication sessions
- Syncs XP information

### Authentication

This endpoint requires an authenticated user session.

Authentication may be handled using:

- Session cookies
- JWT/session tokens
- Wallet-based authentication flow

Possible authentication failures:

| Status Code | Description |
|---|---|
| 401 | Authentication required |
| 403 | Invalid or expired session |

---

# Example Request

```json
{
  "walletAddress": "0x123..."
}
```

---

# Example Response

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "walletAddress": "0x123...",
    "totalXp": 1200,
    "level": 5
  }
}
```

---

# User Data Managed

The API manages:

- Wallet addresses
- XP totals
- Levels
- Streaks
- Verification state
- Session links

---

# User Synchronization Workflow

```text
User Authenticates
  ↓
Session Created
  ↓
User Sync Request
  ↓
Database User Created/Updated
  ↓
XP and Profile Loaded
```

---

# XP and Progression

The User API integrates directly with:

- Gamification system
- Leaderboard system
- Food tracking workflows

User progression updates automatically affect leaderboard rankings.

---

# Error Responses

## User Sync Failure

```json
{
  "success": false,
  "error": "User synchronization failed"
}
```

---

## Authentication Required

```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

# Performance Considerations

The User API is optimized for:

- Fast user lookup
- Efficient synchronization
- Cached progression data
- Reduced database duplication

Efficient synchronization helps reduce unnecessary repeated database writes.

---

# Security Features

Security protections include:

- Authentication validation
- Session verification
- Input sanitization
- Secure database access

---

# Related Documentation

- [Authentication API](./AUTH_API.md)
- [Gamification System](../features/GAMIFICATION.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)