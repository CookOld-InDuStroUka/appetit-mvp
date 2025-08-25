/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // любой один из вариантов:
    domains: ['placehold.co'],         // коротко
    // или точнее:
    // remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
};
module.exports = nextConfig;
