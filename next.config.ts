import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-748cd0b5fd7d4d38a0c3ad5c09d205ae.r2.dev',
        port: '',
        pathname: '/skills/art_bucket/**',
      },
    ],
  },
};

export default nextConfig;
