/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  // Turbopack empty config to silence warnings
  turbopack: {},
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Note: swcMinify is enabled by default in Next.js 13+, no need to specify
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  // Webpack optimizations for better code splitting and minification
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
  // Headers are handled by middleware.ts to avoid conflicts
  // Only DNS prefetch is set here as it doesn't conflict
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(withPWA(nextConfig), {
  // Suppress the Sentry CLI upload wizard (requires SENTRY_AUTH_TOKEN to upload source maps)
  silent: true,
  // Only upload source maps when SENTRY_AUTH_TOKEN is set
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  // Reduce bundle size by tree-shaking unused Sentry modules
  widenClientFileUpload: false,
  // Hide source maps from browser
  hideSourceMaps: true,
  // Disable Sentry's automatic instrumentation of API routes
  autoInstrumentServerFunctions: false,
});
