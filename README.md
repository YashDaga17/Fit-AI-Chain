# 🥗 Fit AI Chain - AI-Powered Calorie Tracker

**Transform your nutrition journey with AI-powered food analysis and gamified tracking!**

Fit AI Chain is a production-ready calorie tracking application that combines artificial intelligence, World App authentication, NeonDB PostgreSQL storage, and gamification to make nutrition tracking engaging and accurate.

## ✨ Key Features

- 🔐 **Real World App Authentication** - SIWE wallet connect with session management
- 🗄️ **NeonDB Integration** - All data persisted in PostgreSQL with Drizzle ORM
- 🏆 **Real Leaderboard** - Compete with actual users, ranked by XP
- 📸 **AI Food Analysis** - Instant nutrition breakdown via Google Gemini AI
- ⚡ **XP & Leveling** - Gamified progression system
- 📊 **Beautiful UI** - Modern, responsive design with Tailwind CSS

## 🚀 Quick Setup Guide

### Prerequisites

Before you start, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### Required Accounts & API Keys

1. **NeonDB Account** (Free tier available)
   - Create account at [neon.tech](https://neon.tech)
   - Create a new database project
   - Copy the connection string

2. **World App Developer Account**
   - Sign up at [developer.worldcoin.org](https://developer.worldcoin.org)
   - Create a new app
   - Get your App ID

3. **Google AI Studio Account** (Optional - for AI features)
   - Get API key from [makersuite.google.com](https://makersuite.google.com/app/apikey)

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Fit-AI-Chain
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create your environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# ===========================================
# REQUIRED: World ID / MiniKit Configuration
# ===========================================
# Get your app ID from https://developer.worldcoin.org
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_your_app_id_here
APP_ID=app_your_app_id_here

# ===========================================
# REQUIRED: Database Configuration
# ===========================================
# Get your database URL from https://neon.tech
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# ===========================================
# OPTIONAL: AI Features
# ===========================================
# For AI food analysis (optional but recommended)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# ===========================================
# OPTIONAL: App Customization
# ===========================================
NEXT_PUBLIC_APP_NAME=Fit AI Chain
NEXT_PUBLIC_APP_DESCRIPTION="Track calories with AI • Earn XP • Compete with friends"
```

### 4. Database Setup

Initialize your database with the required tables:

```bash
# Set up database schema
npm run db:push

# OR if you want to generate migrations first
npm run db:generate
npm run db:push
```

### 5. Start Development Server

```bash
# Start the development server
npm run dev

# Server will be available at http://localhost:3000
```

## 🗄️ Database Management

### Available Database Commands

```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:generate

# Open Drizzle Studio (visual database browser)
npm run db:studio

# Reset database (⚠️ WARNING: This deletes all data!)
node scripts/reset-database.mjs
```

### Database Schema Overview

The application uses the following main tables:

- **`users`** - User profiles, XP, levels, streaks
- **`food_entries`** - Food logs with nutrition data
- **`sessions`** - Authentication sessions
- **`leaderboard_cache`** - Cached leaderboard data for performance

## 🌍 World App Integration & Testing

### Local Development with World App

To test the complete World App integration:

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Expose your local server** (choose one option):

   **Option A: Using ngrok**
   ```bash
   # Install ngrok if you haven't
   npm install -g ngrok

   # Expose your local server
   ngrok http 3000
   ```

   **Option B: Using cloudflared**
   ```bash
   # Install cloudflared
   # Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

   # Expose your local server
   cloudflared tunnel --url http://localhost:3000
   ```

3. **Test in World App**:
   - Copy the HTTPS URL from ngrok/cloudflared
   - Open World App on your phone
   - Navigate to the URL
   - The app will detect World App environment and enable full features

### Authentication Flow

1. User opens app in World App or browser
2. App always shows wallet connect screen (as designed)
3. User clicks "Connect Wallet"
4. MiniKit handles SIWE signature request
5. Server verifies signature and creates session
6. User data synced to database
7. User redirected to tracker page

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── complete-siwe/ # SIWE verification
│   │   ├── nonce/         # Authentication nonces
│   │   ├── user/          # User management
│   │   └── food-logs/     # Food entry endpoints
│   ├── dashboard/         # Dashboard page
│   ├── leaderboard/       # Leaderboard page
│   ├── tracker/           # Main food tracking page
│   └── layout.tsx         # Root layout with MiniKit
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   ├── WalletConnect.tsx # Wallet connection component
│   └── MiniKitProvider.tsx
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication logic
│   ├── useFoodAnalysis.ts # Food AI analysis
│   └── useUserStats.ts   # User statistics
├── lib/                  # Utility libraries
│   ├── db/              # Database configuration
│   │   ├── queries.ts   # Database queries
│   │   └── schema.ts    # Drizzle schema
│   ├── minikit.ts       # MiniKit utilities
│   └── utils.ts         # General utilities
└── utils/               # App-specific utilities
    ├── levelingSystem.ts # XP and leveling logic
    ├── nutritionUtils.ts # Nutrition calculations
    └── commonFoods.ts   # Food database
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Database Management
npm run db:setup     # Initial database setup
npm run db:studio    # Open Drizzle Studio
npm run db:push      # Push schema changes
npm run db:generate  # Generate migrations
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push your code to GitHub**

2. **Deploy to Vercel**:
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables on Vercel**:
   ```
   NEXT_PUBLIC_WORLDCOIN_APP_ID=app_your_app_id_here
   APP_ID=app_your_app_id_here
   DATABASE_URL=postgresql://...
   GOOGLE_API_KEY=your_google_api_key
   ```

### Other Hosting Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- Digital Ocean
- AWS
- Google Cloud Platform

## 🐛 Troubleshooting

### Common Issues

**1. "MiniKit is not installed" Error**
- Ensure you're using the correct MiniKit script version (0.0.77)
- Check that `NEXT_PUBLIC_WORLDCOIN_APP_ID` is set correctly
- Make sure you're testing in World App for full functionality

**2. Database Connection Issues**
- Verify your `DATABASE_URL` is correct
- Ensure your NeonDB instance is active
- Check that your IP is whitelisted in NeonDB (if applicable)

**3. Authentication Not Working**
- Verify both `NEXT_PUBLIC_WORLDCOIN_APP_ID` and `APP_ID` are set
- Ensure they point to the same World App project
- Check that your World App has the correct redirect URLs

**4. AI Features Not Working**
- Verify your `GOOGLE_API_KEY` is valid
- Check API quotas in Google AI Studio
- Ensure the Gemini API is enabled

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📚 Additional Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[DEBUG_GUIDE.md](./DEBUG_GUIDE.md)** - Debugging and troubleshooting
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Feature verification checklist

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

If you run into any issues:

1. Check the troubleshooting section above
2. Review the debug guide: [DEBUG_GUIDE.md](./DEBUG_GUIDE.md)
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, OS, etc.)

---

**Built with ❤️ for the World App ecosystem**

## 🌍 World App Integration

### Authentication Flow

1. User opens app in World App or browser
2. Clicks "Connect Wallet"
3. Approves SIWE signature in World App
4. Server verifies signature
5. User synced to database
6. Ready to track food!

To test the World App integration locally:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Expose your local server** (choose one):
   
   **Option A: ngrok**
   ```bash
   ngrok http 3000
   ```
   
   **Option B: cloudflared**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

4. **Open in World App**:
   - Copy the HTTPS URL from ngrok/cloudflared
   - Open World App on your phone
   - Navigate to the URL
   - The app will detect World App and enable wallet connect

### Why Two World App IDs?

You need **TWO** World App IDs for different purposes:

1. **`NEXT_PUBLIC_WORLDCOIN_APP_ID`** (Client-side)
   - Used by MiniKit in the browser
   - Handles wallet connection UI
   - Must be prefixed with `NEXT_PUBLIC_` to be accessible in browser
   
2. **`APP_ID`** (Server-side)
   - Used for backend verification
   - Validates signatures and nonces
   - Kept secret on the server

**Important**: Both should point to the same World App project!

## 🗄️ Database (NeonDB)

### Schema

```sql
-- Users table
users (
  id, wallet_address, username, world_id_verified,
  total_xp, level, created_at, updated_at
)

-- Food entries
food_entries (
  id, user_id, food_name, calories, protein, carbs,
  fat, fiber, image_id, xp_earned, created_at
)

-- Images
food_images (
  id, user_id, data (base64/url), mime_type, created_at
)

-- Leaderboard snapshots
leaderboard_snapshots (
  id, user_id, rank, total_xp, snapshot_date
)
```

### Database Scripts

```bash
# Set up database from scratch
npm run db:setup

# Open Drizzle Studio (visual DB browser)
npm run db:studio

# Push schema changes
npm run db:push

# Generate migrations
npm run db:generate
```

## 🎮 Features

### Food Tracking
- 📸 Upload food images
- 🤖 AI-powered nutrition analysis (OpenAI GPT-4 Vision)
- 📊 Detailed macronutrient breakdown
- ⚡ Instant XP rewards

### Gamification
- 🏆 XP-based leveling system
- 🎯 Achievements and badges
- 📈 Progress tracking
- � Daily streaks

### Leaderboard
- 🥇 Global rankings by XP
- 👥 Real usernames from wallet
- 📊 Level and entry stats
- 🎯 Your rank highlighted

### UI/UX
- 🎨 Modern, responsive design
- 🌙 Beautiful gradients and animations
- 📱 Mobile-first approach
- ⚡ Fast performance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: MiniKit, SIWE
- **Database**: NeonDB (PostgreSQL), Drizzle ORM
- **AI**: OpenAI GPT-4 Vision
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
Fit-AI-Chain/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   │   ├── user/sync/  # User database sync
│   │   │   ├── food/log/   # Log food entries
│   │   │   ├── leaderboard-db/ # Fetch leaderboard
│   │   │   └── images/[id]/ # Serve images
│   │   ├── leaderboard/    # Leaderboard page
│   │   ├── tracker/        # Food tracking page
│   │   └── page.tsx        # Home/auth page
│   ├── components/         # React components
│   │   ├── WalletConnect.tsx # Auth component
│   │   └── ui/             # shadcn components
│   ├── lib/
│   │   ├── db.ts           # Database connection
│   │   ├── schema.ts       # Drizzle schema
│   │   └── db-utils.ts     # Database utilities
│   └── utils/              # Helper functions
├── scripts/
│   └── setup-db.sh         # Database setup script
├── ARCHITECTURE.md         # System architecture docs
├── QUICKSTART.md           # 5-minute setup guide
└── SETUP_COMPLETE.md       # Feature checklist
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint
```
- **Recovery Systems**: Automatic cleanup of corrupted localStorage data
- **Validation**: Input sanitization and type checking throughout
- **Fallbacks**: Alternative flows when primary systems fail

## 🔧 Troubleshootingntity, and gamification to make nutrition tracking engaging and accurate. Snap a photo of your food and get instant, detailed nutritional analysis with XP rewards and competitive leaderboards.

## ✨ Key Features

### 🤖 Advanced AI Food Analysis
- **Google Gemini AI Integration**: State-of-the-art image recognition for accurate food identification
- **Comprehensive Nutrition Data**: Detailed breakdown of calories, protein, carbs, fat, fiber, sugar, and sodium
- **Multi-Food Detection**: Analyze complex meals with multiple food items in a single photo
- **Smart Portion Estimation**: AI estimates serving sizes using visual context clues
- **Confidence Scoring**: High/medium/low confidence indicators for analysis accuracy
- **Cuisine Recognition**: Identifies food origin and cultural context
- **Allergen Detection**: Automatically identifies potential allergens in foods
- **Health Scoring**: 1-10 health rating with improvement suggestions

### 🎮 Gamified Experience
- **10-Level Progression System**: From "Calorie Curious" (Lv.1) to "Calorie Conqueror" (Lv.10)
- **XP Rewards**: Earn experience points for every food logged (calories ÷ 2 = base XP)
- **Streak Multipliers**: Build daily streaks for bonus XP rewards
- **Category Bonuses**: Extra XP for healthy food choices (vegetables, fruits, lean proteins)
- **Achievement System**: Unlock badges and titles as you progress
- **Competitive Leaderboards**: Compete with friends and the community

### 🔐 World ID Verification
- **Human Authentication**: Ensures one unique account per person using World ID
- **Privacy-First**: Biometric verification without storing personal data
- **Sybil Resistance**: Prevents fake accounts and gaming the system
- **Secure Session Management**: Cryptographic proof verification

### 📱 Modern Mobile-First Design
- **Progressive Web App**: Install on mobile for native-like experience
- **Camera Integration**: Take photos directly with rear camera optimization
- **Beautiful UI**: Modern design with shadcn/ui components and smooth animations
- **Real-Time Updates**: Live progress tracking and instant feedback
- **Responsive Layout**: Perfect experience on desktop, tablet, and mobile

### 📊 Comprehensive Tracking
- **Daily Progress Monitoring**: Visual progress bars for calories and macronutrients
- **Food History**: Complete log of all meals with timestamps and analysis
- **Goal Management**: Customizable daily calorie targets (default 2000)
- **Streak Tracking**: Build and maintain daily logging streaks
- **Detailed Analytics**: Track trends and patterns in your eating habits

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ with npm
- Google Gemini API key ([Get one here](https://ai.google.dev/gemini-api/docs/api-key))
- Modern web browser with camera support

### Installation & Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd Fit-AI-Chain
   npm install
   ```

2. **Environment configuration**
   Create `.env.local` in the project root:
   ```env
   # Required: Google Gemini AI API Key
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   
   # Optional: World ID Configuration
   NEXT_PUBLIC_WLD_APP_ID=app_staging_123...
   NEXT_PUBLIC_WLD_ACTION=track-calories
   WLD_CLIENT_ID=your_client_id
   WLD_CLIENT_SECRET=your_client_secret
   
   # Optional: Development settings
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## � API Endpoints

### `/api/analyze-food` (POST)
Analyzes food images using Google Gemini AI

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "userId": "optional_user_identifier"
}
```

**Response:**
```json
{
  "success": true,
  "food": "Grilled salmon with vegetables",
  "calories": 420,
  "confidence": "high",
  "cuisine": "Mediterranean",
  "portionSize": "6oz salmon, 1 cup mixed vegetables",
  "ingredients": ["salmon", "broccoli", "carrots", "olive oil"],
  "cookingMethod": "grilled",
  "nutrients": {
    "protein": "35g",
    "carbs": "12g",
    "fat": "18g",
    "fiber": "4g",
    "sugar": "6g"
  },
  "healthScore": "8",
  "allergens": ["fish"],
  "alternatives": "Try baking instead of grilling for even healthier preparation",
  "xp": 210
}
```

### `/api/verify` (POST)
Verifies World ID proofs for user authentication

### `/api/food-logs` (GET/POST/DELETE)
Manages user food logging data (session-based storage)

## 🎯 User Journey

### 1. **Landing & Verification**
- Clean, modern landing page explaining app benefits
- World ID verification required for access
- Mobile-optimized World App integration

### 2. **Food Tracking Dashboard**
- Snap photos of meals instantly
- View real-time AI analysis results
- Track daily progress against goals
- Build XP and level up your nutrition game

### 3. **Progress & Competition**
- Monitor daily/weekly nutrition trends
- Compare progress on leaderboards
- Maintain streaks for bonus rewards
- Unlock achievements and new levels

### 4. **Community Features**
- Global leaderboard rankings
- XP-based competitive scoring
- Share achievements and progress

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **AI**: Google Gemini Pro/Flash models
- **Authentication**: World ID (Worldcoin)
- **State Management**: React hooks + localStorage
- **Deployment**: Vercel-optimized

### Key Components
- **`MiniKit.tsx`**: World ID integration and verification flow
- **`TrackerPage.tsx`**: Main food tracking interface with camera
- **`LeaderboardPage.tsx`**: Competitive rankings and user stats
- **`analyze-food/route.ts`**: AI-powered food analysis API
- **`levelingSystem.ts`**: XP calculations and progression logic

## 🔧 Configuration Guide

### Local Development
```bash
# Start development server with Turbopack
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Validate environment setup
chmod +x check-env.sh && ./check-env.sh
```

### Production Deployment (Vercel)

1. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Set environment variables** in Vercel dashboard:
   ```
   GEMINI_API_KEY=your_key_here
   NEXT_PUBLIC_WLD_APP_ID=app_production_id
   WLD_CLIENT_SECRET=your_production_secret
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Configure World ID for production**
   - Update redirect URLs in World Developer Portal
   - Set production app ID and action ID
   - Test verification flow end-to-end

### Testing with ngrok (Mobile Development)
```bash
# Install ngrok
npm i -g ngrok

# Start local server
npm run dev

# In another terminal, create tunnel
ngrok http 3000

# Use the https URL for mobile testing
```

## 🎮 Leveling System

**Level Progression:** 10 total levels from Calorie Curious to Calorie Conqueror

| Level | Title | XP Required | Badge | Description |
|-------|-------|-------------|-------|-------------|
| 1 | Calorie Curious | 0-499 | 🌱 | Just starting your food tracking journey |
| 2 | Portion Pioneer | 500-1,199 | 🥄 | Learning about portion sizes and nutrition |
| 3 | Macro Mapper | 1,200-2,499 | 🍎 | Understanding macronutrients and balanced eating |
| 4 | Nutrition Navigator | 2,500-4,999 | 🧭 | Skilled at making healthy food choices |
| 5 | Calorie Calculator | 5,000-9,999 | 🧮 | Expert at estimating food calories accurately |
| 6 | Diet Detective | 10,000-19,999 | 🔍 | Master of identifying hidden calories |
| 7 | Wellness Warrior | 20,000-39,999 | ⚔️ | Champion of healthy eating and lifestyle |
| 8 | Nutrition Ninja | 40,000-79,999 | 🥷 | Stealthy expert at maintaining perfect nutrition |
| 9 | Food Sage | 80,000-159,999 | 🧙‍♀️ | Wise master of all things nutrition |
| 10 | Calorie Conqueror | 160,000+ | 👑 | Legendary food tracking champion |

**XP Calculation:**
- Base XP = calories ÷ 2
- Healthy food bonus = 1.2x multiplier
- Daily streak bonus = up to 2.0x multiplier

## 🛡️ Security & Privacy

### World ID Integration
- **Zero personal data storage**: Only cryptographic proofs are verified
- **Sybil resistance**: One account per verified human
- **Privacy-first design**: Biometric data never leaves user device
- **Production-ready**: Secure verification endpoints with rate limiting

### API Security
- **Rate limiting**: 10 requests per minute per IP
- **Input validation**: Comprehensive sanitization of all inputs
- **Error handling**: Graceful degradation with fallback responses
- **CORS configuration**: Proper cross-origin resource sharing

## 🔍 Troubleshooting

### Common Issues

**World ID verification fails on Vercel but works with ngrok:**
- Check that your Vercel domain is added to World Developer Portal
- Ensure environment variables are properly set in Vercel dashboard
- Verify CORS headers are properly configured for `worldapp.org` origin
- Make sure `APP_ID` matches `NEXT_PUBLIC_WLD_APP_ID` in production

**World ID verification fails:**
- Check network connection and try again
- Ensure World App is updated to latest version
- Verify app configuration in World Developer Portal
- Check browser console for CORS or network errors

**Font loading errors (404 on fonts):**
- This is a known issue with Geist fonts on Vercel
- The app uses Inter font as fallback which loads properly
- Font errors don't affect functionality

**AI analysis not working:**
- Confirm `GEMINI_API_KEY` is set correctly in Vercel dashboard
- Check API key permissions and usage limits in Google AI Studio
- Take clearer photos with better lighting

**Mobile camera not working:**
- Enable camera permissions in browser
- Use HTTPS (required for camera access)
- Try different browsers if issues persist

### Environment Variables Checklist for Vercel

Make sure these are set in your Vercel project dashboard:
```
GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_WLD_APP_ID=app_staging_xxx (or app_prod_xxx for production)
NEXT_PUBLIC_WLD_ACTION=track-calories (or your custom action)
WLD_CLIENT_ID=your_client_id
WLD_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Debug Mode
Add `?debug=true` to any URL to see debug information and environment status.

### Vercel-Specific Fixes

If you're experiencing issues on Vercel that don't happen locally:

1. **Check build logs** in Vercel dashboard for any environment variable warnings
2. **Redeploy** after setting environment variables
3. **Test API endpoints** directly: `https://your-app.vercel.app/api/verify`
4. **Check World Developer Portal** settings match your Vercel domain
Add `?debug=true` to any URL to see debug information and environment status.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using:**
- [Next.js](https://nextjs.org/) - React framework
- [World ID](https://worldcoin.org/world-id) - Human verification
- [Google Gemini](https://ai.google.dev/) - AI image analysis
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

🌟 **Star this repo if you find it helpful!**
