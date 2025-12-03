import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
  },

  // TypeScript настройки
  typescript: {
    ignoreBuildErrors: true,
  },

  // Typed routes
  typedRoutes: false,

  // Оптимизации для production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Настройки изображений
  images: {
    formats: ['image/avif', 'image/webp'] as const,
  },

  // Заголовки для запрета индексации
  async headers() {
    return [
      {
        // Для всех админских страниц
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        // Для API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },

  // Отключение Turbopack (убедитесь, что нет экспериментальных настроек Turbopack)
  experimental: {
    // Можно добавить другие экспериментальные функции, но не turbopack
  },

  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
