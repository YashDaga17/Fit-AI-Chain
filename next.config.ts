import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_WORLDCOIN_APP_ID: process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
    NEXT_PUBLIC_WORLDCOIN_ACTION: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION,
    NEXT_PUBLIC_WORLDCOIN_SIGNAL: process.env.NEXT_PUBLIC_WORLDCOIN_SIGNAL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  }
};

export default nextConfig;
