/** @type {import('next').NextConfig} */
const path = require('path');

// 确定是否启用MSW
const API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

// 输出环境变量信息
console.log('Next.js环境配置:');
console.log(`- API模拟: ${API_MOCKING ? '启用' : '禁用'}`);
console.log(`- 环境: ${process.env.NODE_ENV}`);

const nextConfig = {
  // 显式设置环境变量
  env: {
    NEXT_PUBLIC_API_MOCKING: API_MOCKING ? 'enabled' : 'disabled',
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_API_BASE_URL: '/api'
  },
  // 允许实验性功能
  experimental: {
    // 设置别名
    turbo: {
      resolveAlias: {
        '@lib': path.resolve(__dirname, './lib'),
        '@components': path.resolve(__dirname, './components'),
      },
    },
  },
  // 图片域名配置
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
  // 解析别名配置
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lib': path.resolve(__dirname, './lib'),
      '@components': path.resolve(__dirname, './components'),
    };
    return config;
  },
  // API重写配置
  async rewrites() {
    // MSW模式下不使用重写
    if (API_MOCKING) {
      console.log('API模拟已启用，不使用API路径重写');
      return [];
    }

    // 非MSW模式下重写API请求路径
    const apiBaseUrl = 'http://192.168.124.75'; // 实际API服务器地址
    console.log(`使用实际API地址: ${apiBaseUrl}`);

    return [
      {
        source: '/api/auth/login',
        destination: `${apiBaseUrl}/common/login/login-by-username`
      },
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`
      }
    ];
  }
};

module.exports = nextConfig; 