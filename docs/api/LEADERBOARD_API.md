# Leaderboard API

This document explains the leaderboard-related API routes used in Fit AI Chain.

---

# Overview

The leaderboard APIs provide ranked XP progression data for users.

The system supports:

- XP rankings
- User progression tracking
- Cached leaderboard queries
- Real-time leaderboard display

The leaderboard displays real user progression data generated through food tracking activity.

---

# Primary Endpoint

## `/api/leaderboard-db`

### Method

```text
GET
```

### Purpose

Fetches leaderboard rankings from the database.

---

# Example Response

```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "username": "FitUser",
      "totalXp": 4500,
      "level": 12
    }
  ]
}
```

---

# Data Sources

Leaderboard data is generated using:

- users table
- leaderboard_cache table
- food_entries table

---

# Leaderboard Workflow

```text
User Logs Food
  ↓
XP Calculated
  ↓
User XP Updated
  ↓
Leaderboard Cache Refreshed
  ↓
Leaderboard API Fetches Rankings
  ↓
Frontend Displays Rankings
```

---

# Ranking Logic

Users are ranked primarily using:

- Total XP
- Activity consistency
- Progression metrics

---

# Caching System

The leaderboard API uses cached ranking data for performance optimization.

Benefits:

- Faster responses
- Reduced database load
- Improved scalability

Caching helps reduce repeated expensive ranking calculations for large datasets.

---

# Error Responses

## Database Failure

```json
{
  "success": false,
  "error": "Failed to fetch leaderboard"
}
```

---

## Empty Rankings

```json
{
  "success": true,
  "leaderboard": []
}
```

---

# Performance Considerations

The leaderboard API is optimized for:

- Frequent leaderboard requests
- Fast ranking retrieval
- Reduced sorting overhead
- Scalable user growth

The API architecture supports future leaderboard expansion features such as seasonal rankings.

---

# Security Considerations

Security protections include:

- Sanitized responses
- Controlled database access
- Request validation

---

# Related Documentation

- [Leaderboard Flow](../architecture/LEADERBOARD_FLOW.md)
- [Gamification System](../features/GAMIFICATION.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)