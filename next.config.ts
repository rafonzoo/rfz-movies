import type { NextConfig } from 'next'
import NextBundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = NextBundleAnalyzer()

const nextConfig: NextConfig = {
  // experimental: {
  //   reactCompiler: true,
  // },
}

export default process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig
