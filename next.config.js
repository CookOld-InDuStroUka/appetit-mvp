/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Используем remotePatterns вместо устаревшего domains
    remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
};
module.exports = nextConfig;
