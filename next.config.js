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
    if (API_MOCKING) {
      console.log('使用MSW模拟API，跳过路径重写');
      return [];
    }
    
    // 非MSW模式下重写API请求路径
    const apiBaseUrl = 'http://192.168.10.75/server'; // 实际API服务器地址
    console.log(`使用实际API地址: ${apiBaseUrl}`);
    console.log('配置API重写规则:');
    console.log(`- /api/auth/login -> ${apiBaseUrl}/auth/login`);
    console.log(`- /api/:path* -> ${apiBaseUrl}/:path*`);

    return [
      {
        source: '/api/auth/login',
        destination: `${apiBaseUrl}/auth/login`
      },
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`
      }
    ];
  }
};

module.exports = nextConfig; 