/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

const nextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@lib": path.resolve(__dirname, "./lib"),
      "@components": path.resolve(__dirname, "./components"),
    };

    // 排除 mocks 文件夹
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }

    // 添加 mocks 文件夹到 webpack 忽略列表
    config.module.rules.push({
      test: /[\\/]mocks[\\/]/,
      loader: "ignore-loader",
    });

    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "@lib": path.resolve(__dirname, "./lib"),
        "@components": path.resolve(__dirname, "./components"),
      },
    },
  },
  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENABLE_MSW: process.env.NEXT_PUBLIC_ENABLE_MSW,
  },
};

module.exports = nextConfig;
