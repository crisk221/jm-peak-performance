/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Optional: uncomment if build still OOMs
  // swcMinify: false,
};
module.exports = nextConfig;
