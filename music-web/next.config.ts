import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true,
  },
  allowedDevOrigins: ['148.113.174.253', '148.113.174.253:7015'],

  async redirects() {
    return [
      {
        source: '/invite',
        destination: process.env.DISCORD_INVITE_URL || '/',
        permanent: false
      },
      {
        source: '/discord',
        destination: process.env.DISCORD_SERVER_URL || '/',
        permanent: false
      }
    ]
  }
};

export default nextConfig;
