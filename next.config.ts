import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Only expose necessary environment variables to client
  env: {
    NEXT_PUBLIC_WORLDCOIN_APP_ID: process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
    NEXT_PUBLIC_WORLDCOIN_ACTION: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION,
    NEXT_PUBLIC_WORLDCOIN_SIGNAL: process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL,
    // Don't expose API keys to client - keep them server-side only
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
