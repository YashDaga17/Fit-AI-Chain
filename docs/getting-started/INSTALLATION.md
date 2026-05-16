# Installation Guide

This guide explains how to fully install and configure Fit AI Chain for local development.

---

# Prerequisites

Before installation, ensure the following are installed:

- Node.js 18+
- npm
- Git

You will also need:

- NeonDB account (for PostgreSQL database setup)
- World App developer account (for authentication integration)
- (Optional) Google Gemini API key

---

# 1. Clone the Repository

```bash
git clone <repository-url>
cd Fit-AI-Chain
```

---

# 2. Install Dependencies

Recommended:

```bash
npm install
```

---

# 3. Configure Environment Variables

Create the environment file:

```bash
cp .env.example .env.local
```

Example configuration:

Update the values with your actual database credentials and API keys.

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_your_app_id
APP_ID=app_your_app_id

DATABASE_URL=postgresql://your_database_url

GOOGLE_API_KEY=your_google_gemini_api_key
```

---

# 4. Database Setup

Push the schema to the database:

This creates the required tables in your NeonDB database.

```bash
npm run db:push
```

Optional migration workflow:

```bash
npm run db:generate
npm run db:push
```

Open Drizzle Studio:

```bash
npm run db:studio
```

Reset database (warning: deletes all data):

```bash
node scripts/reset-database.mjs
```

---

# 5. Start the Development Server

Using npm:

```bash
npm run dev
```

---

# 6. Open the Application

Visit:

```text
http://localhost:3000
```

---

# Optional: World App Local Testing

Using ngrok:

```bash
ngrok http 3000
```

Using cloudflared:

```bash
cloudflared tunnel --url http://localhost:3000
```

Open the generated HTTPS URL in World App on your mobile device.

The app will automatically detect the World App environment and enable authentication features.

---

# Troubleshooting

## Database Connection Issues

- Verify `DATABASE_URL`
- Ensure NeonDB instance is active
- Confirm database permissions

## Authentication Issues

- Ensure both World App IDs are correctly configured
- Verify redirect URLs in World Developer Portal

## AI Features Not Working

- Check `GOOGLE_API_KEY`
- Verify Gemini API access

---

# Verification Checklist

Ensure the following work correctly:

- Application starts without errors
- Database connection succeeds
- Authentication flow works
- AI food analysis responds correctly

# Next Steps

- [Environment Setup](./ENVIRONMENT.md)
- [First Contribution Guide](./FIRST_CONTRIBUTION.md)