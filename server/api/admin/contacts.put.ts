import { defineEventHandler, readBody } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'
import { requireAdmin } from '~/server/utils/auth'

function toTelHref(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  let n = digits
  if (n.length === 11 && n[0] === '8') n = '7' + n.slice(1)
  if (n.length === 10) n = '7' + n
  if (!/^\d{11}$/.test(n)) return ''
  return `tel:+${n}`
}
function safeHttpUrl(u: any) {
  const s = String(u || '').trim()
  if (!s) return ''
  try {
    const url = new URL(s)
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString()
  } catch {}
  return ''
}
function safeMap(u: any) {
  const s = String(u || '').trim()
  if (!s) return ''
  // разрешаем только виджет Яндекса
  if (/^https:\/\/yandex\.(ru|com)\/map-widget\/v1\/\?/.test(s)) return s
  return ''
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const patch = await readBody(event) || {}
  const cur = await readJson('contacts.json').catch(() => ({} as any))

  const phone = String(patch.phone ?? cur.phone ?? '')
  const next = {
    phone,
    phoneHref: toTelHref(phone) || String(patch.phoneHref ?? cur.phoneHref ?? ''),
    social: {
      telegramUrl: safeHttpUrl(patch?.social?.telegramUrl ?? cur?.social?.telegramUrl ?? ''),
      whatsappUrl: safeHttpUrl(patch?.social?.whatsappUrl ?? cur?.social?.whatsappUrl ?? '')
    },
    schedule: String(patch.schedule ?? cur.schedule ?? ''),
    address: String(patch.address ?? cur.address ?? ''),
    ctaLabel: String(patch.ctaLabel ?? cur.ctaLabel ?? ''),
    ctaHref: String(patch.ctaHref ?? cur.ctaHref ?? ''),
    mapEmbed: safeMap(patch.mapEmbed ?? cur.mapEmbed ?? ''),
    bgSrc: String(patch.bgSrc ?? cur.bgSrc ?? ''),
    updatedAt: new Date().toISOString()
  }

  await writeJson('contacts.json', next)
  return next
})
