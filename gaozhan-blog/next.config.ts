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
  // 强制禁用所有安全策略
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline' data:; img-src * data: blob: 'unsafe-inline'; font-src * data:; connect-src * data: blob:; media-src * data: blob:; object-src * data: blob:; child-src * data: blob:; frame-src * data: blob:; worker-src * data: blob: 'unsafe-inline' 'unsafe-eval'; form-action * data:; base-uri * data:; manifest-src * data:;"
          },
          {
            key: 'X-Content-Security-Policy',
            value: ''
          },
          {
            key: 'X-WebKit-CSP',
            value: ''
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
    ];
  },
  // 禁用webpack的eval使用
  webpack: (config, { dev, isServer }) => {
    // 在生产环境中强制禁用eval
    if (!dev) {
      config.devtool = false;
    }
    
    // 禁用所有eval相关的devtool选项
    config.optimization = {
      ...config.optimization,
      minimize: !dev,
    };
    
    return config;
  },
};

export default nextConfig;
