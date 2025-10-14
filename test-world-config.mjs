#!/usr/bin/env node

// Test script to verify World ID / MiniKit configuration
// Run with: node test-world-config.mjs

const appId = 'app_be256001919f34e9e8409e34bb74456f';

console.log('🌍 Testing World ID / MiniKit Configuration');
console.log('=====================================');

console.log('\n📊 Configuration Check:');
console.log(`✅ App ID: ${appId}`);

console.log('\n🔗 URLs to verify in Developer Portal:');
console.log('1. Developer Portal: https://developer.worldcoin.org/');
console.log(`2. Your App Settings: https://developer.worldcoin.org/app/${appId}`);

console.log('\n⚙️ Required Developer Portal Settings:');
console.log('1. App Configuration → Basic Info:');
console.log('   - Name: Fit AI Chain');
console.log('   - Description: AI-Powered Calorie Tracking...');
console.log('   - Website: Your deployment URL');

console.log('\n2. App Configuration → Advanced:');
console.log('   - Enable "Mini App" checkbox');
console.log('   - Add your domain(s) to allowed origins');
console.log('   - If testing locally, add: http://localhost:3000');

console.log('\n3. Incognito Actions (if using World ID verification):');
console.log('   - Create actions like "verify-human", "daily-food-log", etc.');

console.log('\n🧪 Testing recommendations:');
console.log('1. Test in World App first (not browser)');
console.log('2. Check console logs for MiniKit installation');
console.log('3. Verify network requests to /api/nonce and /api/complete-siwe');

console.log('\n🔍 Debug steps:');
console.log('1. Open World App');
console.log('2. Go to Mini Apps');
console.log('3. Add your app or scan QR code');
console.log('4. Check if MiniKit.isInstalled() returns true');

console.log('\n📱 World App Download:');
console.log('iOS: https://apps.apple.com/app/world-app/id1560859632');
console.log('Android: https://play.google.com/store/apps/details?id=org.worldcoin.app');
