# Project Structure

This document explains the folder structure used in Fit AI Chain.

---

# Root Structure

```text
Fit-AI-Chain/
├── docs/
├── src/
├── public/
├── scripts/
├── drizzle/
├── migrations/
└── configuration files
```

---

# Source Directory

Main application code is located inside:

```text
src/
```

---

# App Router Structure

```text
src/app/
```

This directory contains:

- Pages
- Layouts
- API routes
- Route handlers

---

# API Structure

```text
src/app/api/
```

Contains backend API routes for:

- Authentication
- Food analysis
- User synchronization
- Leaderboards

Dynamic API route handling is implemented using App Router conventions such as `[id]` route segments.

---

# Component Structure

```text
src/components/
```

Contains reusable React components.

Examples:

- WalletConnect.tsx
- UI components
- Shared frontend elements

---

# Database Structure

```text
src/lib/
```

Contains:

- Database connection
- Drizzle schema
- Database utilities

Database logic is centralized to improve maintainability and reduce duplicated query handling.

---

# Utility Functions

```text
src/utils/
```

Contains helper functions and reusable utilities.

---

# Scripts Directory

```text
scripts/
```

Contains utility scripts such as:

- Database setup
- Database reset
- Migration helpers

---

# Documentation Structure

```text
docs/
```

Contains organized project documentation.

Main sections include:

- Getting started
- Architecture
- APIs
- Development
- Deployment
- Features
- Troubleshooting
- UI
- Contributing

---

# Public Assets

```text
public/
```

Contains static assets used by the frontend.

Examples:

- Images
- Icons
- Static files

---

# Configuration Files

Examples include:

- next.config.ts
- drizzle.config.ts
- eslint.config.mjs
- tsconfig.json

---

# Architecture Philosophy

The project structure follows:

- Modular organization
- Feature separation
- Scalable architecture
- Maintainable documentation
- Reusable component design

The documentation structure is also designed to improve contributor onboarding and long-term scalability.

---

# Related Documentation

- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [Workflow Guide](./WORKFLOW.md)
- [Coding Standards](./CODING_STANDARDS.md)