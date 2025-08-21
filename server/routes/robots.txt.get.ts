import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const { public: pub } = useRuntimeConfig()
  const siteUrl = String(pub.siteUrl || '').replace(/\/$/, '')
  const isProd = process.env.NODE_ENV === 'production'

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

    const lines = [
      'User-agent: *',
      'Disallow: /admin/',
      siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : ''
    ].filter(Boolean)

  return lines.join('\n') + '\n'
})
