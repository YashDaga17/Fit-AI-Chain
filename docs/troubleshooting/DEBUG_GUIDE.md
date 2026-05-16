# Debug Guide

This document explains debugging strategies for Fit AI Chain.

---

# Overview

Debugging helps identify issues related to:

- Authentication
- API requests
- Database operations
- AI analysis
- Frontend rendering
- Deployment

---

# Browser Debugging

Useful browser tools:

- Console logs
- Network tab
- Application storage
- Responsive mode

---

# API Debugging

Verify:

- Request payloads
- Response formats
- HTTP status codes
- Authentication headers

Useful tools:

- Browser DevTools
- Postman
- Thunder Client

---

# Authentication Debugging

Check:

- Wallet connection
- SIWE verification
- Session creation
- World App configuration

Common issues:

- Expired nonce
- Invalid signature
- Session mismatch

Authentication behavior should be verified both inside World App and standard browsers.

---

# Database Debugging

Use Drizzle Studio:

```bash
npm run db:studio
```

Verify:

- Tables
- User records
- Food entries
- Leaderboard data

---

# Environment Variable Debugging

Verify:

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID
APP_ID
DATABASE_URL
GOOGLE_API_KEY
```

Ensure:

- Variables exist
- Production values are correct
- Secrets are not exposed

---

# AI Analysis Debugging

Check:

- Image upload format
- Gemini API responses
- Processing delays
- API key validity

---

# Frontend Debugging

Verify:

- Responsive layouts
- Console errors
- Component rendering
- State updates

Responsive layouts should be tested across multiple screen sizes.

---

# Mobile Debugging

Test:

- Mobile responsiveness
- World App rendering
- Touch interactions
- Viewport behavior

---

# Build Debugging

Verify:

```bash
npm run build
```

Common causes of failure:

- TypeScript errors
- Missing dependencies
- Invalid environment variables

---

# Logging Recommendations

Useful practices:

- Use readable console logs
- Avoid excessive logging
- Remove debug logs before production

Sensitive credentials and authentication data should never be logged publicly.

---

# Related Documentation

- [Common Issues](./COMMON_ISSUES.md)
- [Testing Guide](../development/TESTING.md)
- [Error Messages](./ERROR_MESSAGES.md)