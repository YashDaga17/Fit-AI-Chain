# Leaderboard Flow

This document explains how the leaderboard system works in Fit AI Chain.

---

# Overview

The leaderboard system ranks users based on XP earned through food tracking and activity participation.

The system encourages:

- Consistent food tracking
- Healthy eating habits
- User engagement
- Competitive progression

The leaderboard displays real users ranked using actual XP progression data.

---

# Leaderboard Workflow

```text
User Logs Food
  ↓
Nutrition Analysis Completed
  ↓
XP Calculated
  ↓
User XP Updated
  ↓
Leaderboard Cache Refreshed
  ↓
Rankings Updated
  ↓
Leaderboard Displayed
```

---

# XP Calculation

XP rewards are generated based on nutrition tracking activity.

Base formula:

```text
XP = calories ÷ 2
```

Additional bonuses may include:

- Healthy food bonus
- Daily streak multiplier
- Category-based rewards

---

# Leaderboard Data Sources

The leaderboard system uses:

- users table
- food_entries table
- leaderboard_cache table

---

# Leaderboard Update Flow

## 1. Food Entry Created

A user submits a food log entry.

---

## 2. XP Calculated

The gamification system calculates earned XP.

---

## 3. User XP Updated

The user's total XP and level are updated.

---

## 4. Cache Refresh

Leaderboard cache entries refresh for faster ranking queries.

---

## 5. Rankings Generated

Users are ranked based on total XP.

---

# Ranking Factors

Primary ranking factors:

- Total XP
- User activity
- Food logging consistency

Future ranking systems may include:

- Achievement points
- Community participation
- Seasonal events

---

# Performance Optimization

The leaderboard system uses caching to reduce repeated database ranking calculations.

Benefits include:

- Faster leaderboard loading
- Reduced database load
- Improved scalability

Caching helps prevent expensive repeated sorting operations on large user datasets.

---

# Frontend Integration

Leaderboard information is displayed through:

- Leaderboard page
- User rank indicators
- XP progress displays

The leaderboard UI may highlight the currently authenticated user's rank separately.

---

# Common Issues

## Rankings Not Updating

- Verify XP calculations
- Refresh leaderboard cache
- Check database synchronization

## Incorrect XP Totals

- Verify food entry calculations
- Check streak bonus logic
- Validate database updates

---

# Related Documentation

- [Gamification System](../features/GAMIFICATION.md)
- [Leaderboard API](../api/LEADERBOARD_API.md)
- [Database Schema](./DATABASE_SCHEMA.md)