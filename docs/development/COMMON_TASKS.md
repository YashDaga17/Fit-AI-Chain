# Common Development Tasks

This document explains common development workflows in Fit AI Chain.

---

# Install Dependencies

Using pnpm:

```bash
pnpm install
```

Using npm:

```bash
npm install
```

---

# Start Development Server

```bash
pnpm run dev
```

OR

```bash
npm run dev
```

---

# Setup Environment Variables

Create environment file:

```bash
cp .env.example .env.local
```

---

# Database Tasks

## Push Database Schema

```bash
pnpm run db:push
```

---

Database schema updates should be tested carefully before deployment.

## Generate Database Migrations

```bash
pnpm run db:generate
```

---

## Open Drizzle Studio

```bash
pnpm run db:studio
```

---

# Reset Database

```bash
node scripts/reset-database.mjs
```

Warning:
This deletes database data.

---

# Run Linting

```bash
npm run lint
```

---

# Build the Project

```bash
npm run build
```

---

# Git Workflow Tasks

## Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

---

## Stage Changes

```bash
git add .
```

---

## Commit Changes

```bash
git commit -m "docs: improve project structure"
```

Keep commits focused and avoid mixing unrelated changes in a single commit.

---

## Push Changes

```bash
git push origin feature/your-feature-name
```

---

# World App Testing

Using ngrok:

```bash
ngrok http 3000
```

Using cloudflared:

```bash
cloudflared tunnel --url http://localhost:3000
```

---

# Debugging Tasks

Useful checks:

- Verify `.env.local`
- Check browser console
- Verify API responses
- Confirm database connection
- Inspect network requests

---

# Documentation Tasks

Examples:

- Add new markdown files
- Update architecture docs
- Improve API examples
- Maintain consistent formatting

Documentation updates should maintain consistent markdown formatting across all sections.

---

# Related Documentation

- [Testing Guide](./TESTING.md)
- [Workflow Guide](./WORKFLOW.md)
- [Environment Setup](../getting-started/ENVIRONMENT.md)