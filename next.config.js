/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lib': path.resolve(__dirname, './lib'),
      '@components': path.resolve(__dirname, './components'),
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        '@lib': path.resolve(__dirname, './lib'),
        '@components': path.resolve(__dirname, './components'),
      },
    },
  },
  async rewrites() {
    return [
      {source: '/api/:path*', destination: 'http://192.168.10.75/server/:path*'}
    ]
  }
};

module.exports = nextConfig; 