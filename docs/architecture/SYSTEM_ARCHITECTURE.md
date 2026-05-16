# System Architecture

This document explains the high-level architecture of Fit AI Chain.

---

# Overview

Fit AI Chain is an AI-powered calorie tracking application that combines:

- AI food analysis
- World ID authentication
- PostgreSQL database storage
- Gamification systems
- Leaderboards and tracking

The application is built using Next.js 15 with App Router architecture.

---

# Core Technologies

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Authentication | MiniKit, SIWE, World ID |
| Database | NeonDB PostgreSQL |
| ORM | Drizzle ORM |
| AI Integration | Google Gemini AI |
| Deployment | Vercel |

---

# High-Level Architecture Flow

```text
User
  ↓
Next.js Frontend
  ↓
API Routes
  ↓
Authentication / AI / Database Services
  ↓
NeonDB PostgreSQL
```

---

# Frontend Architecture

The frontend is built using the Next.js App Router.

Key frontend pages include:

- Home/authentication page
- Food tracker page
- Leaderboard page
- Dashboard interface

Main responsibilities:

- User interface rendering
- Wallet connection
- Food tracking dashboard
- Leaderboard display
- Session management

---

# Backend Architecture

Backend functionality is implemented using Next.js API routes.

Main responsibilities:

- Authentication verification
- Food analysis processing
- Database operations
- Leaderboard calculations
- Session handling

API routes are organized inside the `src/app/api` directory using Next.js App Router conventions.

---

# AI Analysis System

The AI system processes uploaded food images using Google Gemini AI.

Workflow:

1. User uploads food image
2. API route receives image
3. Gemini AI analyzes food content
4. Nutrition data is extracted
5. Results stored in database
6. XP rewards calculated

---

# Authentication Architecture

Authentication is powered using:

- World ID
- SIWE (Sign-In With Ethereum)
- MiniKit

Authentication flow:

1. User connects wallet
2. SIWE request generated
3. Signature verification performed
4. Session created
5. User synced to database

---

# Database Architecture

The application uses NeonDB PostgreSQL with Drizzle ORM.

Primary tables:

- users
- food_entries
- food_images
- sessions
- leaderboard_cache

---

# Scalability Considerations

The architecture supports:

- Modular API routes
- Expandable database schema
- Feature-based separation
- Scalable frontend components
- Cloud deployment workflows

The modular documentation structure also improves long-term maintainability and contributor onboarding.

---

# Security Considerations

Security measures include:

- Secure session handling
- Environment variable protection
- Authentication verification
- Input validation
- Database access control

---

# Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md)
- [Authentication Flow](./AUTH_FLOW.md)
- [AI Flow](./AI_FLOW.md)
- [Leaderboard Flow](./LEADERBOARD_FLOW.md)