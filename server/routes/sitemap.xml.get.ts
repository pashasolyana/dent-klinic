// server/routes/sitemap.xml.get.ts
import { defineEventHandler, setHeader } from 'h3'

function escXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[c] as string))
}

export default defineEventHandler(async (event) => {
  const { public: pub } = useRuntimeConfig()
  const siteUrl = String(pub.siteUrl || '').replace(/\/$/, '') || 'https://example.com'
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  // ТОЛЬКО реальные страницы (без #якорей)
  const urls = [
    '/',
    '/o-klinike',
    '/akcii',
    '/vrachi',
    '/uslugi',
    '/privacy',
    // Добавьте другие публичные страницы по необходимости
  ]

  const nowIso = new Date().toISOString()
  const items = urls.map(u => {
    const isHome = u === '/'
    return [
      '  <url>',
      `    <loc>${escXml(siteUrl + u)}</loc>`,
      `    <lastmod>${nowIso}</lastmod>`,
      `    <changefreq>${isHome ? 'weekly' : 'monthly'}</changefreq>`,
      `    <priority>${isHome ? '1.0' : '0.7'}</priority>`,
      '  </url>'
    ].join('\n')
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`
})
