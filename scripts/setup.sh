#!/bin/bash

# 🥗 Fit AI Chain - Quick Setup Script
# This script helps you get started with the project quickly

echo "🚀 Welcome to Fit AI Chain Setup!"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Use npm package manager
PKG_MANAGER="npm"
echo "✅ Using npm package manager"

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📋 Setting up environment file..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo "⚠️  IMPORTANT: Edit .env.local with your actual credentials!"
    echo ""
    echo "Required environment variables:"
    echo "  - NEXT_PUBLIC_WORLDCOIN_APP_ID (from developer.worldcoin.org)"
    echo "  - NEXT_PUBLIC_WLD_APP_ID (same as above)"
    echo "  - APP_ID (same as above)"
    echo "  - DATABASE_URL (from neon.tech)"
    echo "  - GOOGLE_API_KEY (from makersuite.google.com - optional)"
else
    echo "⚠️  .env.local already exists, skipping..."
fi

echo ""
echo "🗄️  Database setup..."
echo "Make sure you've added your DATABASE_URL to .env.local, then run:"
echo "  $PKG_MANAGER run db:push"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your credentials"
echo "2. Run: $PKG_MANAGER run db:push"
echo "3. Run: $PKG_MANAGER run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo "🐛 For troubleshooting, see DEBUG_GUIDE.md"
echo ""
echo "Happy coding! 🚀"
