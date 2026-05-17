# Environment Variables

This document explains all environment variables used in Fit AI Chain.

---

# Creating the Environment File

Create the file:

```bash
cp .env.example .env.local
```

---

# Required Variables

## World ID Configuration

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_your_app_id
APP_ID=app_your_app_id
```

### NEXT_PUBLIC_WORLDCOIN_APP_ID

Client-side World App ID used by MiniKit in the browser.

### APP_ID

Server-side World App ID used for authentication verification.

Important:
Both variables should reference the same World App project.

---

# Database Configuration

```env
DATABASE_URL=postgresql://your_database_url
```

Used for NeonDB PostgreSQL database connection.

---

# AI Configuration

The AI features are optional but recommended for full functionality.

```env
GOOGLE_API_KEY=your_google_gemini_api_key
```

Used for AI-powered food analysis through Google Gemini.

---

# Optional Variables

## Application Metadata

```env
NEXT_PUBLIC_APP_NAME=Fit AI Chain
NEXT_PUBLIC_APP_DESCRIPTION="Track calories with AI"
```

Used for application branding and metadata.

---

# Development Variables

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Used during local development and debugging.

---

# Security Notes

- Never commit `.env.local`
- Keep API keys private
- Use different credentials for development and production
- Store production secrets securely in deployment platforms

Do not expose server-side secrets in client-side variables prefixed with `NEXT_PUBLIC_`.

---

# Production Environment Setup

For Vercel deployment:

1. Open Vercel Dashboard
2. Go to Project Settings
3. Navigate to Environment Variables
4. Add all required variables

Recommended production variables:

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_production_id
APP_ID=app_production_id
DATABASE_URL=your_production_database_url
GOOGLE_API_KEY=your_production_google_api_key
```

---

# Common Issues

## Invalid Database URL

Ensure the NeonDB connection string includes:

```text
sslmode=require
```

## Authentication Failures

Verify:
- Both World App IDs match
- Redirect URLs are configured correctly

## AI Features Not Working

Check:
- Google API key validity
- Gemini API access permissions

## Missing Environment Variables

The application may fail to start if required variables are undefined.