# Frequently Asked Questions

This document answers common questions about Fit AI Chain.

---

# General Questions

## What is Fit AI Chain?

Fit AI Chain is an AI-powered nutrition tracking application that combines:

- Food image analysis
- XP progression
- Leaderboards
- World ID authentication

---

## What technologies are used?

Main technologies include:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Drizzle ORM
- NeonDB
- Google Gemini AI

---

The application is designed for mobile-friendly nutrition tracking and gamified engagement.

# Development Questions

## How do I start the project locally?

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Where are API routes located?

API routes are located in:

```text
src/app/api/
```

---

## Where are database schemas defined?

Database schemas are located in:

```text
src/lib/schema.ts
```

---

# Authentication Questions

## Why is wallet authentication failing?

Possible causes:

- Invalid configuration
- Expired session
- Wallet permissions
- Incorrect World App setup

---

## Can the app run outside World App?

Yes.

The application supports browser-based development and testing environments.

---

Authentication workflows are designed to work both inside World App and in browser environments.

# AI Analysis Questions

## Why is food analysis failing?

Possible causes:

- Invalid image format
- Missing API key
- AI request failure

---

## Which AI model is used?

The project integrates Google Gemini AI for food analysis.

---

# Database Questions

## Which database is used?

The project uses NeonDB PostgreSQL.

---

## How do I push schema changes?

```bash
pnpm run db:push
```

---

# Deployment Questions

## Which deployment platform is recommended?

Vercel is the recommended deployment platform.

---

## Why is the production build failing?

Verify:

- Environment variables
- Dependency installation
- TypeScript errors

---

# Contribution Questions

## How should pull requests be structured?

Pull requests should:

- Stay focused
- Include clear descriptions
- Avoid unrelated changes

---

## Are beginners welcome?

Yes.

The project is beginner-friendly and welcomes documentation and code contributions.

---

Documentation contributions are highly valuable for improving contributor onboarding.

# Related Documentation

- [Common Issues](./COMMON_ISSUES.md)
- [Contributing Guide](../contributing/CONTRIBUTING.md)
- [Quickstart Guide](../getting-started/QUICKSTART.md)