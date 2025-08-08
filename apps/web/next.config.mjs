/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@jmpp/config", "@jmpp/types", "@jmpp/db", "@jmpp/api"],
  webpack: (config, { isServer }) => {
    // Exclude playwright and related packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        playwright: false,
        'playwright-core': false,
        'chromium-bidi': false,
        electron: false,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        child_process: false,
      };
      
      // Exclude playwright from being bundled
      config.externals = config.externals || [];
      config.externals.push(
        'playwright', 
        'playwright-core', 
        'chromium-bidi',
        'electron',
        ({ context, request }, callback) => {
          // Exclude any playwright-related modules
          if (/playwright|chromium|electron/.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        }
      );
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['playwright', 'playwright-core', 'chromium-bidi', 'electron'],
  },
};

export default nextConfig;
