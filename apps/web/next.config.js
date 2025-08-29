/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Глобально отключаем оптимизацию — пусть грузит из /public как есть
    unoptimized: true,

    // НУЖНО только если у тебя бывают внешние картинки:
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'appetit.duckdns.org' },
      // добавляй свои домены/CDN по мере необходимости
    ],
  },
};

module.exports = nextConfig;
