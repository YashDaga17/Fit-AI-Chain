# Quick Start Guide

Get Fit AI Chain running locally in under 5 minutes.

---

# Prerequisites

Before starting, make sure you have:

- Node.js 18+
- npm
- Git
- A NeonDB account
- A World App developer account
- (Optional) Google Gemini API key for AI features

---

# 1. Clone the Repository

```bash
git clone https://github.com/YashDaga17/Fit-AI-Chain.git
cd Fit-AI-Chain
```

---

# 2. Install Dependencies

Using npm:

```bash
npm install
```

---

# 3. Configure Environment Variables

Create a `.env.local` file in the project root.
Copy the example environment file:

```bash
cp .env.example .env.local
```

Example:

```env
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_your_app_id
APP_ID=app_your_app_id

DATABASE_URL=postgresql://your_database_url

GOOGLE_API_KEY=your_google_gemini_key
```

---

# 4. Setup the Database

Initialize the database schema:

```bash
npm run db:push
```

Optional migration workflow:

```bash
npm run db:generate
npm run db:push
```

---

# 5. Start the Development Server

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

# Features Available

- AI-powered food analysis
- XP and leveling system
- Real-time leaderboard
- World ID authentication
- Food tracking dashboard
- PostgreSQL database integration

---

# World App Testing

To test the app inside World App locally:

Using ngrok:

```bash
ngrok http 3000
```

Using cloudflared:

```bash
cloudflared tunnel --url http://localhost:3000
```

# Next Steps

Continue with:

- [Installation Guide](./INSTALLATION.md)
- [Environment Setup](./ENVIRONMENT.md)
- [First Contribution Guide](./FIRST_CONTRIBUTION.md)