# 🐛 Troubleshooting Guide

This guide helps you resolve common issues when setting up and running Fit AI Chain.

## 🚀 Quick Fixes

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
pnpm install
# OR
npm install
```

### "MiniKit is not installed" error
1. Check that `NEXT_PUBLIC_WLD_APP_ID` is set in `.env.local`
2. Verify MiniKit script version is 0.0.77 in `layout.tsx`
3. Test in actual World App on mobile device
4. Clear browser cache and reload

### Database connection issues
1. Verify `DATABASE_URL` in `.env.local` is correct
2. Test connection: `node scripts/test-db-connection.mjs`
3. Check NeonDB dashboard - database might be sleeping
4. Ensure SSL is enabled: `?sslmode=require` in URL

## 🔧 Environment Setup Issues

### Missing environment variables
Make sure these are set in `.env.local`:
```bash
# Required
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_your_actual_id
NEXT_PUBLIC_WLD_APP_ID=app_your_actual_id  
APP_ID=app_your_actual_id
DATABASE_URL=postgresql://...

# Optional but recommended
GOOGLE_API_KEY=your_api_key
```

### World App ID issues
- All three World App variables should have the SAME app ID
- Get your app ID from [developer.worldcoin.org](https://developer.worldcoin.org)
- Format: `app_xxxxxxxxxxxxxxxxxxxxxxxxx`

## 🗄️ Database Issues

### Schema/Migration problems
```bash
# Reset and recreate schema
pnpm run db:push

# If still issues, manual reset:
node scripts/reset-database.mjs
pnpm run db:push
```

### Connection timeout
- NeonDB free tier databases auto-sleep
- First connection after sleep takes ~10-15 seconds
- Subsequent connections are fast

## 🌍 World App Integration Issues

### Local testing with World App
1. Start dev server: `pnpm run dev`
2. Expose with ngrok: `ngrok http 3000`
3. Use HTTPS URL in World App
4. Make sure your app is approved in World Developer Portal

### Authentication not working
1. Verify app ID is correct in World Developer Portal
2. Check that both client and server app IDs match
3. Ensure SIWE is properly configured
4. Check browser console for detailed errors

## 🤖 AI Features Issues

### Google Gemini API errors
1. Verify API key is correct
2. Check quotas in Google AI Studio
3. Ensure Gemini API is enabled for your project
4. AI features are optional - app works without them

## 📱 Mobile/World App Specific

### App not loading in World App
1. Ensure URL is HTTPS (use ngrok/cloudflared)
2. Check World App logs in developer portal
3. Verify app is approved and published
4. Test in World App Simulator first

### MiniKit functionality issues
1. MiniKit only works inside World App
2. Desktop browsers show fallback mode
3. Check MiniKit version compatibility
4. Verify app configuration in World Portal

## 🔍 Debugging Steps

### Enable debug mode
Add to `.env.local`:
```bash
NODE_ENV=development
DEBUG=true
```

### Check logs
```bash
# Browser console logs
# Check Network tab for API failures
# Check Application tab for localStorage

# Server logs
tail -f .next/trace
```

### Test components individually
1. Test database connection: `pnpm run db:studio`
2. Test API endpoints with curl/Postman
3. Test MiniKit in isolation
4. Test auth flow step-by-step

## 🆘 Still Having Issues?

1. **Check existing issues**: Search GitHub issues for similar problems
2. **Create new issue**: Include:
   - Operating system and version
   - Node.js version
   - Package manager (npm/pnpm)
   - Error messages (full stack trace)
   - Steps to reproduce
   - Screenshots if relevant

3. **Common info to include**:
   ```bash
   node --version
   npm --version  # or pnpm --version
   cat package.json | grep "next"
   ```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [World App Developer Portal](https://developer.worldcoin.org)
- [NeonDB Documentation](https://neon.tech/docs)
- [MiniKit Documentation](https://docs.worldcoin.org/minikit)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

---

**💡 Pro tip**: Most issues are environment-related. Double-check your `.env.local` file first!
