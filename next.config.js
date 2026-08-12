/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Allow large file uploads (videos/audio) — removes 4MB body limit
  experimental: {
    serverActions: {
      bodySizeLimit: '600mb',
    },
    // @sparticuz/chromium's compressed Chromium binary lives under bin/ and is
    // loaded by file path at runtime, not via import/require — Next's default
    // serverless function tracing doesn't pick it up on its own, so it has to
    // be listed explicitly or the deployed function can't find the browser.
    outputFileTracingIncludes: {
      '/api/certificates/pdf': ['./node_modules/@sparticuz/chromium/bin/**'],
    },
  },
};

module.exports = nextConfig;