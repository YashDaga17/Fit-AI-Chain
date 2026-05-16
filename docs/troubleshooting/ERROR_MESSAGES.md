# Error Messages Guide

This document explains common error messages in Fit AI Chain.

---

# Authentication Errors

## "Invalid Signature"

Meaning:
The wallet signature verification failed.

Possible causes:

- Incorrect wallet signature
- Expired nonce
- Authentication mismatch

---

## "Authentication Required"

Meaning:
The request requires an authenticated user session.

Possible causes:

- Expired session
- Missing login
- Invalid authentication state

---

## "Verification Failed"

Meaning:
World ID verification was unsuccessful.

Possible causes:

- Invalid proof
- Verification timeout
- Incorrect World App configuration

---

Authentication-related issues should be tested both inside World App and browser environments.

# AI Analysis Errors

## "AI analysis failed"

Meaning:
The AI processing request did not complete successfully.

Possible causes:

- Gemini API failure
- Invalid image upload
- Network issue

---

## "Invalid image format"

Meaning:
The uploaded image format is unsupported.

Recommended formats:

- JPG
- PNG
- WEBP

---

## "GOOGLE_API_KEY missing"

Meaning:
The Google Gemini API key is not configured.

Solution:

Verify:

```env
GOOGLE_API_KEY=
```

exists inside `.env.local`.

---

Large image uploads may increase AI processing time.

# Database Errors

## "Database connection failed"

Meaning:
The application could not connect to NeonDB.

Possible causes:

- Invalid DATABASE_URL
- SSL configuration problems
- Database downtime

---

## "Failed to fetch leaderboard"

Meaning:
Leaderboard data retrieval failed.

Possible causes:

- Database query failure
- Cache synchronization issues
- Server error

---

# Build Errors

## "Module not found"

Meaning:
A required dependency or file is missing.

Solution:

```bash
npm install
```

---

## "TypeScript compilation failed"

Meaning:
TypeScript validation detected invalid code.

Solution:

- Review TypeScript errors
- Verify imports
- Check interfaces and types

---

# Deployment Errors

## "Build failed on Vercel"

Possible causes:

- Missing environment variables
- Dependency problems
- Build configuration errors

---

Production deployments should verify all required environment variables before building.

# Mobile Errors

## "World App rendering issue"

Meaning:
The UI does not render correctly inside World App.

Possible causes:

- Layout overflow
- Responsive design issue
- Unsupported browser behavior

---

# Related Documentation

- [Common Issues](./COMMON_ISSUES.md)
- [Debug Guide](./DEBUG_GUIDE.md)
- [FAQ](./FAQ.md)