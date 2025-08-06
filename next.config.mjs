/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除静态导出，保持SSR功能
  trailingSlash: true,
  
  // SVG支持配置
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 性能优化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // 压缩优化
  compress: true,
  
  // PWA和缓存优化
  headers: async () => {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // 重定向配置
  redirects: async () => {
    return [
      // 404死链重定向
      {
        source: '/guides/best-starting-words',
        destination: '/strategy',
        permanent: true,
      },
      {
        source: '/guides/5-letter-word-tips',
        destination: '/strategy',
        permanent: true,
      },
      {
        source: '/guides/word-puzzle-strategy',
        destination: '/strategy',
        permanent: true,
      },
      {
        source: '/guides/puzzle-ranking-system',
        destination: '/guide/rankings',
        permanent: true,
      },
      {
        source: '/guides',
        destination: '/strategy',
        permanent: true,
      },
      {
        source: '/rankings/word-puzzle',
        destination: '/guide/rankings',
        permanent: true,
      },
      {
        source: '/rankings/2048',
        destination: '/guide/rankings',
        permanent: true,
      },
      {
        source: '/rankings',
        destination: '/guide/rankings',
        permanent: true,
      },
      {
        source: '/leaderboard',
        destination: '/guide/rankings',
        permanent: true,
      },
      {
        source: '/2048-game',
        destination: '/',
        permanent: true,
      },
      {
        source: '/word-puzzle',
        destination: '/',
        permanent: true,
      },
      {
        source: '/statistics',
        destination: '/guide/stats',
        permanent: true,
      },
      {
        source: '/player-stats',
        destination: '/guide/stats',
        permanent: true,
      },
      {
        source: '/daily-challenge',
        destination: '/',
        permanent: true,
      },
      {
        source: '/achievements',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tournaments',
        destination: '/',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/about',
        permanent: true,
      },
    ]
  },
}

export default nextConfig