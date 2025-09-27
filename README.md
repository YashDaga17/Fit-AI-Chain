# 🥗 FitAI Chain - AI-Powered Calorie Tracker

FitAI Chain is a modern, secure calorie tracking application that uses AI-powered image analysis with Agentverse Agents  to analyze food photos and provide detailed nutritional information. The app features World ID verification for secure user authentication and a beautiful UI built with shadcn/ui and Lucide icons.

## ✨ Features

### 🤖 AI-Powered Food Analysis
- **Conservative Estimates**: Provides the smallest/most conservative calorie estimates to help users stay within their fitness goals
- **Detailed Nutritional Breakdown**: Analyzes protein, carbohydrates, fat, fiber, sugar, and sodium content
- **Multiple Food Detection**: Can identify and analyze multiple food items in a single image
- **Data Source Attribution**: Indicates where nutritional data comes from (USDA, etc.)

### 🔐 Secure Authentication
- **World ID Verification**: Ensures each user is a unique human
- **Privacy-First**: No personal data collection beyond verification
- **Session Management**: Secure session handling with tokens

### 🎨 Modern UI/UX
- **shadcn/ui Components**: Beautiful, accessible UI components
- **Lucide Icons**: Modern, consistent iconography
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Progress**: Live updates of daily calorie and macro tracking
- **Interactive Dialogs**: Detailed food analysis in beautiful modal windows

### 📱 Camera & Upload Support
- **Native Camera**: Take photos directly from the app
- **File Upload**: Upload existing photos from your device
- **Mobile Optimized**: Uses rear camera for better food photography

### 📊 Comprehensive Tracking
- **Daily Progress**: Track calories, protein, carbs, and fat
- **Food History**: View all your past food entries
- **Progress Visualization**: Beautiful progress bars and charts
- **Goal Tracking**: Set and monitor daily calorie goals

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Google AI API key (for Gemini)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Get your Gemini API key from [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)
   - Add your API key to `.env.local`:
     ```
     GEMINI_API_KEY=your_actual_gemini_api_key_here
     ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# World ID Configuration 
NEXT_PUBLIC_APP_ID=your_worldcoin_app_id_here
NEXT_PUBLIC_ACTION=your_action_name
NEXT_PUBLIC_SIGNAL=your_signal_name
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

## 🔐 World ID Integration

This app demonstrates how to integrate World ID for human verification:

1. **Frontend Widget**: Uses `@worldcoin/idkit` for the verification modal
2. **Backend Verification**: API endpoint at `/api/verify` handles proof verification
3. **User Flow**: Users must verify with World ID before accessing calorie tracking

### Key Components:

- **IDKitWidget**: React component that handles the World ID verification flow
- **handleVerify**: Callback that sends the proof to your backend for verification
- **onSuccess**: Callback that redirects users after successful verification

## 🍽️ Calorie Tracker Features

- **Food Logging**: Add custom foods with calories and quantities
- **Quick Add**: Pre-configured common foods for fast logging
- **Progress Tracking**: Visual progress bar showing daily calorie intake
- **Goal Management**: Customizable daily calorie goals
- **Smart Interface**: Remove foods, track totals, and monitor remaining calories

## 🛡️ Security

- All World ID verification happens server-side to prevent tampering
- Biometric data never leaves the user's device
- Cryptographic proofs ensure authenticity
- No personal data is stored without consent

## 📱 Usage Flow

1. **Landing Page**: Introduction to the app and World ID benefits
2. **Verification**: Users verify their humanity with World ID
3. **Calorie Tracking**: Access to the full calorie tracking dashboard
4. **Progress Monitoring**: Track daily intake and progress towards goals

---

Built with ❤️ using World ID, Next.js, and Tailwind CSS
