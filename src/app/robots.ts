import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/admin/*',
        '/user/',
        '/user/*',
        '/api/',
        '/debug/',
        '/debug/*',
        '/_next/',
        '/static/',
        '/maintenance'
      ],
    },
    //sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourapp.fiscalnic.ru'}/sitemap.xml`,
  }
}