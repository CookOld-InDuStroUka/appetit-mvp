/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Используем remotePatterns вместо устаревшего domains
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http', hostname: 'localhost', port: '3001' },
    ],
  },
};
module.exports = nextConfig;
