/** @type {import('next').NextConfig} */
const path = require('path');

// 根据环境确定是否使用代理重写
const { NEXT_PUBLIC_ENV, NEXT_PUBLIC_API_MOCKING } = process.env;
const shouldUseRewrites = NEXT_PUBLIC_API_MOCKING !== 'enabled';

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
    // 如果启用了MSW，则不使用重写规则
    if (NEXT_PUBLIC_API_MOCKING === 'enabled') {
      console.log('API模拟已启用，不使用URL重写');
      return [];
    }

    // 确定正确的API基础URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.124.75';
    console.log(`使用API基础URL: ${apiBaseUrl}`);

    return [
      {
        source: '/api/auth/login',
        destination: `${apiBaseUrl}/common/login/login-by-username`
      },
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`
      }
    ]
  }
};

module.exports = nextConfig; 