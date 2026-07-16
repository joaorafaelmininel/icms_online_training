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
  },
};

module.exports = nextConfig;