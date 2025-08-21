// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      titleTemplate: (t?: string) =>
        t ? `${t} — Стоматологическая клиника доктора Бронникова`
          : 'Стоматологическая клиника доктора Бронникова',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0b2c44' },
        // базовое описание для сниппета
        {
          name: 'description',
          content:
            'Стоматология доктора Бронникова — консультации, диагностика, терапия, имплантация и протезирование. Бесплатная первая консультация, тщательный осмотр и расчет лечения.'
        },
        // OG по умолчанию
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Стоматологическая клиника доктора Бронникова' }
      ],
    },
  },

  css: ['@/assets/styles/main.scss'],

  runtimeConfig: {
    mail: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 465,
      secure: process.env.MAIL_SECURE === 'true',
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
      from: process.env.MAIL_FROM
    },
    admin : {
      password: process.env.NUXT_ADMIN_PASSWORD,
      secret: process.env.NUXT_ADMIN_SECRET,
    },
    public: {
      siteUrl: process.env.SITE_URL || '',
      site: process.env.SITE_URL || '',
      siteName: 'Стоматологическая клиника доктора Бронникова',
      defaultOgWidth: 1200,
      defaultOgHeight: 630
    }
  },

  nitro: {
    routeRules: {
      // ВАЖНО: все имена заголовков — строчные
      '/**': {
        headers: {
          'x-frame-options': 'DENY',
          'x-content-type-options': 'nosniff',
          'referrer-policy': 'strict-origin-when-cross-origin',
          'permissions-policy': 'geolocation=(), camera=(), microphone=()',
          'cross-origin-opener-policy': 'same-origin',
          'cross-origin-resource-policy': 'same-site',
          'origin-agent-cluster': '?1',
          'x-dns-prefetch-control': 'off',
          'x-permitted-cross-domain-policies': 'none',
          // HSTS имеет смысл только на HTTPS — но выставлять можно всегда
          'strict-transport-security': 'max-age=15552000; includeSubDomains',
         // CSP: разрешаем inline-скрипты и Яндекс.Карты
        'content-security-policy':
  [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline'",
    "frame-src 'self' https://yandex.ru https://yandex.ru/map-widget/v1/",
    "connect-src 'self' https:"
  ].join('; ')
        }
      },
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/**/*.(png|jpg|jpeg|webp|gif|svg|ico)': {
        headers: { 'cache-control': 'public, max-age=2592000' }
      },
      '/**/*.(woff|woff2|ttf|otf)': {
        headers: { 'cache-control': 'public, max-age=31536000, immutable' }
      },
      '/sitemap.xml': { prerender: true },
      '/robots.txt': { prerender: true }
    }
  }
})
