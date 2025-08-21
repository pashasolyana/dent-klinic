import { defineEventHandler, readBody, createError } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'
import { requireAdmin } from '~/server/utils/auth'

function sanitizeHtml(html) {
  if (typeof html !== 'string') return ''

  // вырезаем опасное
  html = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  // иногда пользователи вставляют <span style="..."> — нормализуем в b/i/u
  html = html
    .replace(/<span\b[^>]*style="[^"]*font-weight\s*:\s*(bold|[6-9]00|bolder)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<b>$2</b>')
    .replace(/<span\b[^>]*style="[^"]*font-style\s*:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<i>$1</i>')
    .replace(/<span\b[^>]*style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<u>$1</u>')

  // убираем on* и style=
  html = html
    .replace(/\s(on\w+|style)\s*=\s*"(?:[^"\\]|\\.)*"/gi, '')
    .replace(/\s(on\w+|style)\s*=\s*'(?:[^'\\]|\\.)*'/gi, '')

  // разрешённые теги (без stateful RegExp!)
  const ALLOWED = new Set(['a','b','strong','i','em','u','br','p','ul','ol','li'])
  html = html.replace(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi, (m, tag) =>
    ALLOWED.has(String(tag).toLowerCase()) ? m : ''
  )

  // чистим <a>: только безопасные href/target/rel + class
  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (m, attrs, inner) => {
    const getAttr = (name) => {
      const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
      const m2 = attrs.match(re)
      return m2 ? (m2[2] ?? m2[3] ?? m2[4] ?? '') : ''
    }
    let href = getAttr('href')
    const cls = getAttr('class')
    let target = getAttr('target')

    const okHref = href.startsWith('#') || href.startsWith('/') ||
      /^https?:/i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href)
    href = okHref ? href : ''

    if (!['_blank','_self','_parent','_top'].includes(target)) target = ''

    const parts = []
    if (href) parts.push(`href="${href.replace(/"/g,'&quot;')}"`)
    if (cls) parts.push(`class="${cls.replace(/"/g,'&quot;')}"`)
    if (target) parts.push(`target="${target}"`)
    parts.push('rel="noopener"')

    return `<a ${parts.join(' ')}>${inner}</a>`
  })

  return html
}

export default defineEventHandler( async (event) => {
  requireAdmin(event)
  const id = Number(event.context.params.id)
  const patch = await readBody(event) || {}

  const list = await readJson('promo.json').catch(() => [])
  const idx = list.findIndex((s:any) => Number(s.id) === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Slide not found' })

  const cur = list[idx]
 const next = {
  ...cur,
  title: String(patch.title ?? cur.title ?? '').trim(),
  text: sanitizeHtml(String(patch.text ?? cur.text ?? '')),
  img: String(patch.img ?? cur.img ?? '').trim(),
  discount: patch.discount ?? cur.discount ?? null,
  price: patch.price ?? cur.price ?? null,
  ctaText: String(patch.ctaText ?? cur.ctaText ?? ''),
  ctaHref: String(patch.ctaHref ?? cur.ctaHref ?? ''),
  free: !!(patch.free ?? cur.free)
}
  list[idx] = next
  await writeJson('promo.json', list)
  return next
})
