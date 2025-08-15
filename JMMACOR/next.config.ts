import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Vercel-optimized settings (remove aggressive memory limits)
  swcMinify: true,
  experimental: {
    // Remove worker thread restrictions for Vercel
  },
};

export default nextConfig;
