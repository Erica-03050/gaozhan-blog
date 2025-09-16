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
    
    // 强制设置为production模式，完全避免eval
    config.mode = 'production';
    
    // 确保没有eval相关的优化
    config.optimization = {
      ...config.optimization,
      minimize: true, // 强制压缩，避免eval
      concatenateModules: false, // 禁用模块合并
      usedExports: true,
      sideEffects: false,
    };
    
    // 移除所有可能产生eval的插件
    config.plugins = (config.plugins || []).filter(plugin => {
      return !plugin.constructor.name.includes('HotModuleReplacement') &&
             !plugin.constructor.name.includes('SourceMap');
    });
    
    // 强制设置resolve模式
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };
    
    // 禁用所有开发相关的功能
    config.cache = false;
    config.watch = false;
    
    return config;
  },
};

export default nextConfig;
