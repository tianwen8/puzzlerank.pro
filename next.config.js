/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig