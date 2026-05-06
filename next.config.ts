import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
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
