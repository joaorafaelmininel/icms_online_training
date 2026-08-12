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
    // Keep these out of the webpack bundle for route handlers — webpack
    // rewrites module locations, which breaks @sparticuz/chromium's
    // __dirname-relative lookup of its own binary files even when
    // outputFileTracingIncludes copies them into the deployment. Leaving
    // them external preserves normal node_modules layout at runtime so
    // that lookup keeps working. (Next 14 key — renamed to the top-level
    // `serverExternalPackages` in Next 15+.)
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  },
};

module.exports = nextConfig;