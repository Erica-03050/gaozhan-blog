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
  // 强制移除所有CSP相关头部
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: '',
          },
          {
            key: 'X-Content-Security-Policy', 
            value: '',
          },
          {
            key: 'X-WebKit-CSP',
            value: '',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
