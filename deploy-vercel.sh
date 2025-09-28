#!/bin/bash

echo "🚀 Deploying Fit AI Chain to Vercel..."

# Check if required environment variables are set locally
echo "🔍 Checking local environment variables..."

required_vars=("GEMINI_API_KEY" "NEXT_PUBLIC_WLD_APP_ID")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    else
        echo "✅ $var is set"
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    echo "📝 Please set these in your .env.local file and run 'source .env.local' or set them in Vercel dashboard"
fi

# Build the project to check for errors
echo "🔨 Building project locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Verify environment variables are set in Vercel dashboard"
echo "2. Test World ID integration: https://your-app.vercel.app"
echo "3. Check browser console for any CORS errors"
echo "4. Update World Developer Portal with your Vercel domain"
echo ""
echo "🔍 Debug URL: https://your-app.vercel.app?debug=true"
