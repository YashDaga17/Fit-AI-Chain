#!/usr/bin/env node

// Debug script for World ID deployment issues
// Run this on both ngrok and Vercel to compare

console.log('🔍 World ID Deployment Debug');
console.log('==========================');

// Environment variables
console.log('\n📊 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_WLD_APP_ID:', process.env.NEXT_PUBLIC_WLD_APP_ID ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_WORLDCOIN_APP_ID:', process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID ? '✅ Set' : '❌ Missing');

// Current URL detection
if (typeof window !== 'undefined') {
  console.log('\n🌐 Current Environment:');
  console.log('URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Hostname:', window.location.hostname);
  console.log('Protocol:', window.location.protocol);
  
  // User Agent
  console.log('\n📱 User Agent Info:');
  console.log('User Agent:', navigator.userAgent);
  console.log('Is World App UA:', navigator.userAgent.toLowerCase().includes('worldapp'));
  console.log('Is MiniKit UA:', navigator.userAgent.toLowerCase().includes('minikit'));
  
  // MiniKit detection
  console.log('\n🔧 MiniKit Detection:');
  try {
    const { MiniKit } = require('@worldcoin/minikit-js');
    console.log('MiniKit available:', typeof MiniKit !== 'undefined');
    console.log('MiniKit installed:', MiniKit.isInstalled?.());
  } catch (error) {
    console.log('MiniKit error:', error.message);
  }
  
  // World bridges
  console.log('\n🌉 Bridge Detection:');
  console.log('WorldApp bridge:', typeof window.WorldApp !== 'undefined');
  console.log('WebKit bridge:', typeof window.webkit?.messageHandlers?.minikit !== 'undefined');
}

console.log('\n🔑 Action Items for Vercel:');
console.log('1. Add your Vercel domain to World ID Developer Portal');
console.log('2. Set environment variables in Vercel dashboard');
console.log('3. Check CORS headers for your domain');
console.log('4. Verify SSL certificate (World ID requires HTTPS)');

export default function DebugPage() {
  return null;
}
