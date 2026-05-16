# Production Environment Variables

This document explains the environment variables required for production deployment.

---

# Overview

Environment variables are used to securely configure:

- Authentication
- Database connections
- AI integrations
- Application metadata

Production secrets should never be committed to Git.

Environment variables should be configured separately for development, preview, and production environments.

---

# Required Variables

## World ID Configuration

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_production_id
APP_ID=app_production_id
```

### NEXT_PUBLIC_WORLDCOIN_APP_ID

Client-side World App ID used by MiniKit.

### APP_ID

Server-side application ID used for authentication verification.

Important:
Both variables should reference the same World App project.

---

# Database Configuration

```env
DATABASE_URL=postgresql://your_database_url
```

Used for NeonDB PostgreSQL production database connection.

---

# AI Configuration

```env
GOOGLE_API_KEY=your_google_api_key
```

Used for Google Gemini AI food analysis.

The AI configuration is required for AI-powered food analysis features.

Without `GOOGLE_API_KEY`, food image analysis endpoints may fail or return limited functionality.

---

# Optional Variables

## Application Metadata

```env
NEXT_PUBLIC_APP_NAME=Fit AI Chain
NEXT_PUBLIC_APP_DESCRIPTION="AI-powered nutrition tracking"
```

---

# Vercel Setup

To configure environment variables in Vercel:

1. Open Vercel Dashboard
2. Open Project Settings
3. Navigate to Environment Variables
4. Add required values

---

# Security Recommendations

- Never commit `.env.local`
- Keep production secrets private
- Use separate development and production credentials
- Rotate sensitive credentials regularly

Do not expose sensitive server-side secrets using variables prefixed with `NEXT_PUBLIC_`.

---

# Common Issues

## Missing Variables

The application may fail during build or runtime if required variables are missing.

---

## Invalid Database URL

Verify:

```text
sslmode=require
```

is included in the database connection string.

---

## Authentication Failures

Verify:

- Matching World App IDs
- Correct redirect URLs
- Valid production domains

---

# Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Vercel Deployment](./VERCEL.md)
- [Environment Setup](../getting-started/ENVIRONMENT.md)