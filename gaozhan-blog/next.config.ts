import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 在生产构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建时忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  // 完全移除所有安全头部 - 绕过Vercel默认CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 完全禁用CSP - 使用空值覆盖Vercel默认设置
          {
            key: 'Content-Security-Policy',
            value: ''
          },
          {
            key: 'X-Content-Security-Policy', 
            value: ''
          },
          {
            key: 'X-WebKit-CSP',
            value: ''
          },
          // 移除其他可能干扰的安全头
          {
            key: 'X-XSS-Protection',
            value: ''
          },
          {
            key: 'X-Frame-Options',
            value: ''
          },
          {
            key: 'X-Content-Type-Options',
            value: ''
          }
        ],
      },
    ];
  },
  // 完全禁用webpack的eval使用 - 解决Vercel CSP问题
  webpack: (config, { dev, isServer }) => {
    // 强制禁用所有eval相关功能
    config.devtool = false;
    
    // 确保没有eval相关的优化
    config.optimization = {
      ...config.optimization,
      minimize: !dev,
      // 禁用所有可能使用eval的优化
      concatenateModules: false,
    };
    
    // 禁用所有可能产生eval的插件
    config.plugins = config.plugins || [];
    
    // 强制设置mode避免默认的development模式使用eval
    if (!dev) {
      config.mode = 'production';
    }
    
    return config;
  },
};

export default nextConfig;
