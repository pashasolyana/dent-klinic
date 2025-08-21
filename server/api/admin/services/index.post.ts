import { promises as fsp } from 'node:fs'
import { dirname, join } from 'node:path'

const FILE = join(process.cwd(), 'server/data/services.json')

export default defineEventHandler(async (event) => {
  const b = (await readBody(event)) || {}
  const title = String(b.title ?? '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'title required' })

  const slug = String(b.slug ?? title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-')).replace(/^-+|-+$/g,'')
  const img = String(b.img ?? '/images/placeholder.png')
  const href = String(b.href ?? `/uslugi/${slug}`)
  const active = b.active !== false

  let list: any[] = []
  try { list = JSON.parse((await fsp.readFile(FILE)).toString()) } catch {
    await fsp.mkdir(dirname(FILE), { recursive: true })
  }
  if (list.find(x => x.slug === slug)) {
    throw createError({ statusCode: 409, statusMessage: 'slug exists' })
  }

  const item: any = {
    slug, title, img, href, alt: String(b.alt ?? ''), active,
    order: list.length ? Math.max(...list.map(x => x.order ?? 0)) + 1 : 1
  }
  list.push(item)
  await fsp.writeFile(FILE, JSON.stringify(list, null, 2))
  return item
})
