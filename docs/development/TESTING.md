# Testing Guide

This document explains how to test Fit AI Chain during development.

---

# Testing Goals

Testing helps ensure:

- Features work correctly
- APIs respond properly
- Authentication functions securely
- UI behaves consistently
- Database operations succeed

---

# Local Development Testing

Start the development server:

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

# Authentication Testing

Test the following:

- Wallet connection
- SIWE authentication
- Session persistence
- Logout flow

Authentication should be tested both inside World App and in browser development environments.

---

# AI Analysis Testing

Test:

- Image uploads
- AI nutrition analysis
- XP calculation
- Food logging workflows

Recommended:
Use clear food images with good lighting.
Test different food categories to verify nutrition estimation consistency.

---

# Database Testing

Verify:

- Database connection
- User creation
- Food entry storage
- Leaderboard updates

Useful command:

```bash
npm run db:studio
```

---

# API Testing

Test API routes using:

- Browser developer tools
- Postman
- Thunder Client
- Frontend integration

Important routes:

- `/api/analyze-food`
- `/api/nonce`
- `/api/complete-siwe`
- `/api/leaderboard-db`

---

# Mobile Testing

The application should also be tested on:

- Mobile browsers
- World App environment

---

# World App Local Testing

Using ngrok:

```bash
ngrok http 3000
```

Using cloudflared:

```bash
cloudflared tunnel --url http://localhost:3000
```

Open the generated HTTPS URL in World App.

---

# Error Testing

Test edge cases such as:

- Invalid images
- Failed authentication
- Missing environment variables
- Database disconnections
- API failures

---

# Debugging Tools

Useful tools:

- Browser DevTools
- Network tab
- Console logs
- Drizzle Studio
- VS Code debugger

---

# Performance Testing

Verify:

- Fast page loading
- Responsive UI behavior
- Efficient API responses
- Stable image uploads

Large image uploads should be tested to verify request handling stability.

---

# Common Testing Checklist

Before opening a pull request:

- Application starts successfully
- No console errors
- APIs respond correctly
- Database operations work
- UI remains responsive
- Documentation is updated

---

# Related Documentation

- [Debug Guide](../troubleshooting/DEBUG_GUIDE.md)
- [Environment Setup](../getting-started/ENVIRONMENT.md)
- [Workflow Guide](./WORKFLOW.md)