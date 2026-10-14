import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['148.113.174.253', '148.113.174.253:7015'],
  transpilePackages: ['../global'],

  async redirects() {
    return [
      {
        source: '/invite',
        destination: '/redirect?to=invite',
        permanent: false
      },
      {
        source: '/discord',
        destination: '/redirect?to=discord',
        permanent: false
      },
      {
        source: '/support',
        destination: '/redirect?to=support',
        permanent: false
      },
      {
        source: '/tos',
        destination: '/redirect?to=tos',
        permanent: false
      },
      {
        source: '/privacy',
        destination: '/redirect?to=privacy',
        permanent: false
      },
      {
        source: '/contact',
        destination: '/redirect?to=contact',
        permanent: false
      }
    ]
  }
};

export default nextConfig;
