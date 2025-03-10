/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

const nextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com"],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@lib": path.resolve(__dirname, "./lib"),
      "@components": path.resolve(__dirname, "./components"),
    };
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
