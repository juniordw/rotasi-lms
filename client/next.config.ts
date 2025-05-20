// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,
  
  // For development troubleshooting:
  typescript: {
    // During development, let TypeScript errors not prevent development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;