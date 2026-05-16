# Vercel Deployment Guide

This document explains how to deploy Fit AI Chain using Vercel.

---

# Why Vercel?

Fit AI Chain uses Next.js, making Vercel the recommended deployment platform because it provides:

- Native Next.js support
- Serverless API hosting
- Automatic deployments
- Environment variable management
- Fast global delivery

The project architecture is designed to work efficiently with Vercel serverless API routes.

---

# Prerequisites

Before deployment:

- Push your repository to GitHub
- Create a Vercel account
- Configure NeonDB
- Prepare production environment variables

---

# Import the Repository

1. Open Vercel Dashboard
2. Click **Add New Project**
3. Import the GitHub repository
4. Select the Fit AI Chain repository

---

# Configure Environment Variables

Add the following variables inside Vercel:

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_production_id
APP_ID=app_production_id

DATABASE_URL=your_production_database_url

GOOGLE_API_KEY=your_google_api_key
```

---

# Build Settings

Recommended build configuration:

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | `.next` |

---

# Deploy the Application

After configuration:

1. Click **Deploy**
2. Wait for build completion
3. Open the generated deployment URL

---

# Database Setup After Deployment

Push the production schema:

```bash
pnpm run db:push
```

Verify:

- Database connectivity
- Schema creation
- API functionality

---

# Recommended Production Checks

Verify:

- Authentication works
- AI analysis works
- Database operations succeed
- Leaderboards load correctly
- Mobile responsiveness works

Test the application inside World App after deployment verification.

---

# Updating Deployments

New deployments are automatically triggered when changes are pushed to the connected branch.

Keeping pull requests small and focused helps reduce deployment risks.

---

# Common Vercel Issues

## Build Failure

Possible causes:

- Missing environment variables
- TypeScript errors
- Dependency issues

---

## API Route Failure

Verify:

- Serverless compatibility
- Environment variable configuration
- Database connection

---

## Authentication Issues

Verify:

- Correct production URLs
- World App redirect configuration
- Matching World App IDs

---

# Security Recommendations

- Store secrets securely in Vercel
- Avoid exposing server-side credentials
- Use production databases only

---

# Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./ENV_VARIABLES.md)
- [Database Migration](./DATABASE_MIGRATION.md)