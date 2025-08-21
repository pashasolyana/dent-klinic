import { promises as fsp } from 'node:fs'
import { dirname, join } from 'node:path'

const FILE = join(process.cwd(), 'server/data/doctors-hero.json')

export default defineEventHandler(async (event) => {
  const b = (await readBody(event)) || {}

  const data = {
    title: String(b.title ?? '').trim().slice(0, 120) || 'Врачи',
    subtitle: String(b.subtitle ?? '').trim().slice(0, 800),
    ctaText: String(b.ctaText ?? 'Подробнее').trim().slice(0, 60),
    ctaHref: String(b.ctaHref ?? '/vrachi').trim().slice(0, 300),
    showCta: Boolean(b.showCta ?? true),
    bgUrl: String(b.bgUrl ?? '/images/bg.png'),
  }

  await fsp.mkdir(dirname(FILE), { recursive: true })
  await fsp.writeFile(FILE, JSON.stringify(data, null, 2))
  return { ok: true, data }
})
