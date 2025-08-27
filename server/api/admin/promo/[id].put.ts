import { defineEventHandler, readBody, createError } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'
import { requireAdmin } from '~/server/utils/auth'

function sanitizeHtml(html: any) {
  if (typeof html !== 'string') return ''
  // вырезаем опасности
  html = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  // нормализация span->b/i/u
  html = html
    .replace(/<span\b[^>]*style="[^"]*font-weight\s*:\s*(bold|[6-9]00|bolder)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<b>$2</b>')
    .replace(/<span\b[^>]*style="[^"]*font-style\s*:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<i>$1</i>')
    .replace(/<span\b[^>]*style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<u>$1</u>')

  // убираем on* и style=
  html = html
    .replace(/\s(on\w+|style)\s*=\s*"(?:[^"\\]|\\.)*"/gi, '')
    .replace(/\s(on\w+|style)\s*=\s*'(?:[^'\\]|\\.)*'/gi, '')

  // whitelisting
  const ALLOWED = new Set(['a','b','strong','i','em','u','br','p','ul','ol','li'])
  html = html.replace(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi, (m, tag) =>
    ALLOWED.has(String(tag).toLowerCase()) ? m : ''
  )

  // чистим <a>
  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (m, attrs, inner) => {
    const getAttr = (name: string) => {
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

function normStr(v: any) { return String(v ?? '').trim() }
function asNumOrStr(v: any) {
  const s = String(v ?? '').trim().replace(/\s+/g,'')
  if (!s) return ''
  return /^\d+$/.test(s) ? Number(s) : s // разрешим и строковое «4 900 ₽» после фронта
}

export default defineEventHandler( async (event) => {
  requireAdmin(event)
  const id = Number(event.context.params.id)
  const patch = await readBody(event) || {}

  const list = await readJson('promo.json').catch(() => [])
  const idx = list.findIndex((s:any) => Number(s.id) === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Slide not found' })

  const cur = list[idx]

  // --- НОВОЕ: нормализация offers[] (если пришли) ---
  let offers = Array.isArray(patch.offers) ? patch.offers : cur.offers
  if (Array.isArray(offers)) {
    offers = offers.map((o:any, k:number) => {
      const id = normStr(o.id) || `o-${id}-${k}`
      const free = !!o.free
      const price = free ? null : (o.price ?? null)
      const safePrice = price ? {
        old: asNumOrStr(price.old),
        new: asNumOrStr(price.new),
        label: normStr(price.label)
      } : null
      return {
        id,
        text: sanitizeHtml(normStr(o.text)),
        free,
        price: safePrice
      }
    })
  } else {
    // ОБРАТНАЯ СОВМЕСТИМОСТЬ: если офферов нет — соберем из старых полей
    const free = !!(patch.free ?? cur.free)
    const price = free ? null : (patch.price ?? cur.price ?? null)
    offers = [{
      id: `legacy-${id}`,
      text: sanitizeHtml(normStr(patch.text ?? cur.text ?? '')),
      free,
      price: price ? {
        old: asNumOrStr(price.old),
        new: asNumOrStr(price.new),
        label: normStr(price.label)
      } : null
    }]
  }

  const next = {
    ...cur,
    title: normStr(patch.title ?? cur.title),
    text: sanitizeHtml(normStr(patch.text ?? cur.text)),
    img: normStr(patch.img ?? cur.img),
    discount: patch.discount ?? cur.discount ?? null,
    // сохраняем только новую модель:
    offers,
    // старые поля оставим (необязательно), чтобы фронт со старым кодом не упал
    price: patch.price ?? cur.price ?? null,
    ctaText: normStr(patch.ctaText ?? cur.ctaText),
    ctaHref: normStr(patch.ctaHref ?? cur.ctaHref),
    free: !!(patch.free ?? cur.free)
  }

  list[idx] = next
  await writeJson('promo.json', list)
  return next
})
