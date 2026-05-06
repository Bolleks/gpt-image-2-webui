import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  generateBuildId: async () => {
    // Stable build ID prevents Server Action cache mismatches in Docker
    return process.env.GIT_SHA || 'production-build';
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tempfile.*',
      },
      {
        protocol: 'https',
        hostname: 'tempfile.aiquickdraw.com',
      },
    ],
  },
};

export default nextConfig;
