# Authentication Flow

This document explains the authentication workflow used in Fit AI Chain.

---

# Authentication Technologies

Fit AI Chain uses:

- World ID
- MiniKit
- SIWE (Sign-In With Ethereum)
- Session-based authentication

---

# Authentication Overview

The authentication system allows users to securely connect their wallets and verify identity using World ID.

The workflow ensures:

- Secure wallet authentication
- Session persistence
- User synchronization
- Protection against fake accounts

The authentication flow is designed to work both inside World App and in standard browser environments.

---

# Authentication Flow Diagram

```text
User
  ↓
Connect Wallet
  ↓
MiniKit SIWE Request
  ↓
Wallet Signature
  ↓
Server Verification
  ↓
Session Creation
  ↓
Database Sync
  ↓
Access Granted
```

---

# Step-by-Step Flow

## 1. User Opens Application

The user opens the application inside:

- World App
- Browser environment

---

## 2. Wallet Connection

The user clicks the wallet connect button.

MiniKit initializes the authentication request.

The wallet connection UI is handled using the `WalletConnect.tsx` component.

---

## 3. SIWE Signature Request

A SIWE message is generated and sent to the user wallet.

The user approves the signature request.

---

## 4. Signature Verification

The backend verifies:

- Wallet ownership
- Nonce validity
- Signature authenticity

---

## 5. Session Creation

After verification:

- Session is created
- User authentication state is stored
- Session linked to database user

---

## 6. User Synchronization

The application synchronizes:

- Wallet address
- XP information
- User profile data
- Verification state

---

# World App IDs

Two environment variables are used:

## NEXT_PUBLIC_WORLDCOIN_APP_ID

Client-side World App identifier used by MiniKit.

## APP_ID

Server-side application identifier used for verification.

Important:
Both variables should point to the same World App project.

---

# Security Features

Authentication security includes:

- Nonce validation
- Signature verification
- Session expiration
- Secure environment variables
- Verification checks

World ID integration helps provide sybil resistance by limiting fake or duplicate accounts.

---

# Related API Routes

| Route | Purpose |
|---|---|
| `/api/nonce` | Generates authentication nonce |
| `/api/complete-siwe` | Verifies SIWE signature |
| `/api/verify` | Verifies authentication session |
| `/api/user/sync` | Synchronizes user data |

---

# Common Authentication Issues

## Wallet Connection Failure

- Verify World App configuration
- Check MiniKit setup
- Ensure browser compatibility

## Verification Failure

- Verify matching World App IDs
- Check nonce handling
- Ensure correct redirect URLs

## Session Problems

- Clear local storage
- Re-authenticate
- Verify session expiration handling

---

# Related Documentation

- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [World ID Feature](../features/WORLD_ID.md)
- [Authentication API](../api/AUTH_API.md)