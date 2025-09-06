/** @type {import('next').NextConfig} */
const { withVercelToolbar } = require('@vercel/toolbar/plugins/next')();

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Core settings
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compress: true,

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-slot'
    ],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME || "localhost",
        port: "",
      },
      {
        protocol: "https", 
        hostname: process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME || "localhost",
        port: "",
      },
      // Common WordPress media hostnames
      {
        protocol: "https",
        hostname: "*.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "*.wp.com",
      },
      // CDN hostnames - add your CDN domains here
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      // Unsplash for demo images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
    ],
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return (
                  !module.resource?.includes('node_modules') &&
                  module.size() > 160000
                );
              },
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              priority: 20,
              minChunks: 2,
              reuseExistingChunk: true,
            },
            shared: {
              name: 'shared',
              chunks: 'all',
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: blob: https: ${process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME || 'localhost'};
              media-src 'self' https: ${process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME || 'localhost'};
              connect-src 'self' https://www.google-analytics.com ${process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost'};
              frame-src 'none';
              base-uri 'self';
              form-action 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ];
  },

  // Redirects for WordPress compatibility
  async redirects() {
    return [
      // WordPress admin redirects
      {
        source: '/wp-admin/:path*',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/wp-login.php',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/wp-config.php',
        destination: '/404',
        permanent: false,
      },
      // Feed redirects
      {
        source: '/feed',
        destination: '/api/feed',
        permanent: false,
      },
      {
        source: '/feed/:path*',
        destination: '/api/feed',
        permanent: false,
      },
    ];
  },

  // Environment variables for client-side
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // Output configuration for static export (if needed)
  output: process.env.BUILD_STATIC === 'true' ? 'export' : undefined,
  
  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

// Apply plugins
let configWithPlugins = nextConfig;

// Apply bundle analyzer in development or when ANALYZE=true
if (process.env.NODE_ENV === 'development' || process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer(configWithPlugins);
}

// Apply Vercel Toolbar in development
if (process.env.NODE_ENV === 'development') {
  try {
    configWithPlugins = withVercelToolbar(configWithPlugins);
  } catch (error) {
    console.warn('Vercel Toolbar not available:', error.message);
  }
}

module.exports = configWithPlugins;
