# Deployment Guide

This document explains how to deploy Fit AI Chain to production environments.

---

# Deployment Overview

Fit AI Chain is designed for cloud deployment using:

- Vercel
- NeonDB PostgreSQL
- Environment-based configuration

The deployment workflow includes:

- Environment setup
- Database configuration
- Production builds
- Hosting platform deployment

The architecture is optimized for serverless deployment workflows.

---

# Prerequisites

Before deployment, ensure:

- Production database is ready
- Environment variables are configured
- Build process succeeds locally
- Required APIs are enabled

---

# Build the Application

Using npm:

```bash
npm run build
```

Using pnpm:

```bash
pnpm build
```

---

# Production Environment Variables

Required production variables:

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_production_id
APP_ID=app_production_id

DATABASE_URL=your_production_database_url

GOOGLE_API_KEY=your_google_api_key
```

---

# Database Deployment

Push database schema:

```bash
pnpm run db:push
```

Verify:

- Tables created successfully
- Database connection works
- Production credentials are correct

---

# Recommended Deployment Workflow

```text
Local Development
  ↓
Testing
  ↓
Production Build
  ↓
Environment Setup
  ↓
Database Migration
  ↓
Deploy to Hosting Platform
  ↓
Production Verification
```

---

# Production Verification Checklist

Verify:

- Application loads correctly
- Authentication works
- AI analysis functions properly
- Leaderboards load correctly
- Database operations succeed

Test both browser and World App authentication flows after deployment.

---

# Common Deployment Issues

## Build Failures

- Verify dependencies
- Check TypeScript errors
- Ensure environment variables exist

---

## Database Connection Failure

- Verify DATABASE_URL
- Confirm NeonDB availability
- Check SSL configuration

---

## Authentication Problems

- Verify production World App IDs
- Confirm redirect URLs
- Check domain configuration

---

# Security Recommendations

- Use production-only credentials
- Protect environment variables
- Avoid exposing server secrets
- Enable HTTPS

Never expose sensitive API keys through `NEXT_PUBLIC_` variables.

---

# Related Documentation

- [Vercel Deployment](./VERCEL.md)
- [Environment Variables](./ENV_VARIABLES.md)
- [Database Migration](./DATABASE_MIGRATION.md)