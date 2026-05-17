# Common Issues

This document lists common problems and solutions for Fit AI Chain.

---

# Installation Issues

## Dependency Installation Failure

Possible causes:

- Unsupported Node.js version
- Network problems
- Corrupted package cache

Solution:

```bash
npm install
```

Verify Node.js version:

```bash
node -v
```

---

# Environment Variable Issues

## Missing Environment Variables

Symptoms:

- Authentication failures
- AI analysis not working
- Build failures

Solution:

Verify `.env.local` contains:

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=
APP_ID=
DATABASE_URL=
GOOGLE_API_KEY=
```

---

# Database Connection Issues

## Failed Database Connection

Possible causes:

- Invalid DATABASE_URL
- NeonDB downtime
- SSL configuration problems

Verify database URL format:

```text
postgresql://...
```

---

# Authentication Problems

## Wallet Connection Failure

Possible causes:

- Unsupported browser
- Wallet permissions
- World App configuration

Solutions:

- Refresh the application
- Reconnect wallet
- Verify World App setup

---

## SIWE Verification Failure

Possible causes:

- Invalid signature
- Expired nonce
- Session mismatch

---

Authentication should be tested both in browser environments and inside World App.

# AI Analysis Problems

## Food Analysis Failure

Possible causes:

- Invalid image upload
- Missing API key
- Gemini API request failure

Solutions:

- Use supported image formats
- Verify GOOGLE_API_KEY
- Retry the request

---

Large image uploads may increase processing time during AI analysis.

# Leaderboard Problems

## Rankings Not Updating

Possible causes:

- XP sync failure
- Cache refresh issues
- Database update delays

Solutions:

- Verify user synchronization
- Refresh leaderboard cache
- Check database updates

---

# Build Problems

## Production Build Failure

Verify:

```bash
npm run build
```

Possible causes:

- TypeScript errors
- Missing environment variables
- Dependency conflicts

---

# Deployment Issues

## Vercel Deployment Failure

Verify:

- Environment variables
- Database connectivity
- Build logs

---

# Mobile Compatibility Issues

## World App Rendering Problems

Possible causes:

- Layout overflow
- Unsupported browser APIs
- Responsive UI problems

Solutions:

- Verify responsive layouts
- Test on mobile devices
- Check viewport behavior

---

World App webview compatibility should be tested during frontend updates.

# Related Documentation

- [Debug Guide](./DEBUG_GUIDE.md)
- [Error Messages](./ERROR_MESSAGES.md)
- [Testing Guide](../development/TESTING.md)