import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'api.qrserver.com'],
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
            value: 'SAMEORIGIN' // Changed from DENY to allow World App embedding
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Add CSP header for production security
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // MiniKit requires unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.qrserver.com https://developer.worldcoin.org",
              "frame-ancestors 'self' https://worldapp.org https://*.worldapp.org", // Allow World App frames
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          }] : [])
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : 'https://worldapp.org'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, User-Agent'
          }
        ]
      }
    ]
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Handle World App specific routing
  async rewrites() {
    return [
      // Allow World App to access the app
      {
        source: '/worldapp/:path*',
        destination: '/:path*',
      },
    ]
  },
};

export default nextConfig;
