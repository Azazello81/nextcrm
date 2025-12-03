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
        '/_next/',
        '/static/'
      ],
    },
    //sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourapp.fiscalnic.ru'}/sitemap.xml`,
  }
}