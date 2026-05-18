# Authentication API

This document explains the authentication-related API routes used in Fit AI Chain.

---

# Authentication Overview

Authentication is powered using:

- World ID
- MiniKit
- SIWE (Sign-In With Ethereum)

The authentication APIs handle:

- Nonce generation
- Wallet verification
- Session creation
- User synchronization

The authentication APIs are designed to work both inside World App and in browser-based development environments.

---

# API Endpoints

## `/api/nonce`

### Method

```text
GET
```

### Purpose

Generates a secure nonce used for SIWE authentication.

### Example Response

```json
{
  "nonce": "random_nonce_value"
}
```

---

## `/api/complete-siwe`

### Method

```text
POST
```

### Purpose

Verifies SIWE wallet signatures and creates authenticated sessions.

### Example Request

```json
{
  "message": "SIWE message",
  "signature": "wallet_signature"
}
```

### Example Response

```json
{
  "success": true,
  "session": {
    "userId": "123"
  }
}
```

---

## `/api/verify`

### Method

```text
POST
```

### Purpose

Verifies World ID proofs and authentication status.

### Example Request

```json
{
  "proof": "world_id_proof"
}
```

### Example Response

```json
{
  "verified": true
}
```

---

# Authentication Workflow

```text
User Connects Wallet
  ↓
Nonce Generated
  ↓
SIWE Message Signed
  ↓
Backend Verification
  ↓
Session Created
  ↓
User Synced
```

---

# Session Handling

The authentication system manages:

- Session creation
- Session expiration
- User persistence
- Wallet linking

Authenticated sessions are linked to user progression and leaderboard systems.

---

# Security Features

Authentication security includes:

- Nonce validation
- Signature verification
- Request validation
- Session protection

The authentication system helps reduce fake accounts through World ID verification mechanisms.

---

# Common Errors

## Invalid Signature

Occurs when wallet signature verification fails.

---

## Expired Nonce

Occurs when the authentication nonce is no longer valid.

---

## Verification Failure

Occurs when World ID verification fails.

---

# Related Documentation

- [Authentication Flow](../architecture/AUTH_FLOW.md)
- [User API](./USER_API.md)
- [World ID Feature](../features/WORLD_ID.md)