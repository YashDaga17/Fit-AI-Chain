# Database Schema

This document explains the database structure used in Fit AI Chain.

---

# Database Technology

Fit AI Chain uses:

- NeonDB PostgreSQL
- Drizzle ORM

NeonDB provides managed PostgreSQL hosting with cloud scalability and serverless compatibility.

The database stores authentication data, food tracking information, XP progression, and leaderboard statistics.

---

# Core Tables

## users

Stores user profile and progression information.

### Fields

| Field | Description |
|---|---|
| id | Unique user ID |
| wallet_address | Connected wallet address |
| username | User display name |
| world_id_verified | Verification status |
| total_xp | Total accumulated XP |
| level | Current user level |
| streak | Daily streak tracking |
| created_at | Account creation timestamp |
| updated_at | Last update timestamp |

---

## food_entries

Stores all food tracking records.

### Fields

| Field | Description |
|---|---|
| id | Unique food entry ID |
| user_id | Linked user |
| food_name | Detected food name |
| calories | Calorie count |
| protein | Protein value |
| carbs | Carbohydrate value |
| fat | Fat value |
| fiber | Fiber value |
| xp_earned | XP gained from entry |
| image_id | Linked food image |
| created_at | Entry creation timestamp |

---

## sessions

Stores authentication session information.

### Fields

| Field | Description |
|---|---|
| id | Session ID |
| user_id | Linked user |
| wallet_address | Connected wallet |
| created_at | Session creation time |
| expires_at | Expiration timestamp |

---

## leaderboard_cache

Stores cached leaderboard information for performance optimization.

### Fields

| Field | Description |
|---|---|
| id | Cache entry ID |
| user_id | Linked user |
| rank | Leaderboard rank |
| total_xp | Total XP |
| updated_at | Last refresh timestamp |

## food_images

Stores uploaded food image metadata.

### Fields

| Field | Description |
|---|---|
| id | Image ID |
| user_id | Linked user |
| data | Image URL or encoded data |
| mime_type | Image format |
| created_at | Upload timestamp |

---

# Database Relationships

```text
users
 ├── food_entries
 ├── sessions
 └── leaderboard_cache
```

---

# Database Workflow

1. User authenticates
2. User record created or updated
3. Food entries stored
4. XP calculated
5. Leaderboard cache updated

---

# Database Commands

## Push Schema

```bash
pnpm run db:push
```

## Generate Migrations

```bash
pnpm run db:generate
```

## Open Drizzle Studio

```bash
pnpm run db:studio
```

---

# Schema Management

Database schema updates are handled using Drizzle ORM migrations.

Recommended workflow:

1. Modify schema
2. Generate migrations
3. Push migrations
4. Verify database changes

---

# Performance Considerations

The database architecture supports:

- Efficient leaderboard queries
- Fast user lookups
- Scalable food entry storage
- Cached ranking calculations

Caching leaderboard data helps reduce repeated expensive ranking queries.

---

# Security Considerations

- Secure database credentials
- Environment-based configuration
- Controlled database access
- Session expiration handling