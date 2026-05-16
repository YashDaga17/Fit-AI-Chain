# Database Migration Guide

This document explains how to manage database schema updates in Fit AI Chain.

---

# Migration Overview

Fit AI Chain uses:

- NeonDB PostgreSQL
- Drizzle ORM migrations

Database migrations help keep schema changes consistent across environments.

Database schema management is centralized through Drizzle ORM configuration files.

---

# Migration Workflow

```text
Update Schema
  ↓
Generate Migration
  ↓
Push Migration
  ↓
Verify Database Changes
```

---

# Generate Migrations

Generate migration files:

```bash
pnpm run db:generate
```

This creates migration files based on schema changes.

---

# Push Schema Updates

Push changes to the database:

```bash
pnpm run db:push
```

---

# Open Drizzle Studio

Inspect the database visually:

```bash
pnpm run db:studio
```

---

# Example Workflow

## 1. Update Schema

Modify:

```text
src/lib/schema.ts
```

---

## 2. Generate Migration

```bash
pnpm run db:generate
```

---

## 3. Push Migration

```bash
pnpm run db:push
```

---

## 4. Verify Database

Use Drizzle Studio to verify:

- Tables
- Fields
- Relationships
- Data consistency

---

# Reset Database

Warning:
This removes existing database data.

```bash
node scripts/reset-database.mjs
```

---

# Production Migration Recommendations

Before production migrations:

- Backup the database
- Test migrations locally
- Verify schema compatibility
- Review migration files carefully

Large schema changes should be tested carefully in staging environments before production deployment.

---

# Common Migration Issues

## Migration Failure

Possible causes:

- Invalid schema changes
- Database connection issues
- Conflicting migrations

---

## Missing Tables

Verify:

- Schema definitions
- Successful migration execution
- Database connection

---

## Data Inconsistency

Check:

- Migration order
- Field types
- Constraint compatibility

---

# Security Recommendations

- Protect production credentials
- Avoid direct production schema editing
- Review migration scripts before execution

Always verify production database targets before running migration commands.

---

# Related Documentation

- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./ENV_VARIABLES.md)