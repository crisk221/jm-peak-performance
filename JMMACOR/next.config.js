/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Aggressive memory optimizations
  swcMinify: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};
module.exports = nextConfig;
