import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set explicit root directory for turbopack
  turbopack: {
    root: __dirname,
  },
  images: {
    domains: ['localhost', 'api.qrserver.com'],
  },
  // Explicitly allow dev origins for World App MiniKit and ngrok
  allowedDevOrigins: process.env.NODE_ENV === 'development' 
    ? ['localhost:3000', '127.0.0.1:3000', 'worldapp.org', '*.worldapp.org', '*.ngrok-free.dev', '*.ngrok.io']
    : undefined,
  // Only expose necessary environment variables to client
  env: {
    NEXT_PUBLIC_WLD_APP_ID: process.env.NEXT_PUBLIC_WLD_APP_ID || process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
    NEXT_PUBLIC_WLD_ACTION: process.env.NEXT_PUBLIC_WLD_ACTION || process.env.NEXT_PUBLIC_WORLDCOIN_ACTION,
    NEXT_PUBLIC_WLD_SIGNAL: process.env.NEXT_PUBLIC_WLD_SIGNAL || process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL,
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://worldapp.org https://*.worldapp.org", // MiniKit requires unsafe-eval
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://api.qrserver.com https://developer.worldcoin.org https://worldapp.org https://*.worldapp.org wss://worldapp.org",
              "frame-ancestors 'self' https://worldapp.org https://*.worldapp.org", // Allow World App frames
              "frame-src 'self' https://worldapp.org https://*.worldapp.org",
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
            value: process.env.NODE_ENV === 'development' 
              ? '*' 
              : 'https://worldapp.org, https://fit-ai-chain.vercel.app'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, User-Agent, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
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
