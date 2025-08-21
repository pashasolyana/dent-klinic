import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

const FILE = join(process.cwd(), 'server/data/services.json')

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const b = (await readBody(event)) || {}
  const list: any[] = JSON.parse((await fsp.readFile(FILE)).toString())
  const i = list.findIndex(x => x.slug === slug)
  if (i < 0) throw createError({ statusCode: 404, statusMessage: 'not found' })

  const cur = list[i]
  list[i] = {
    ...cur,
    title: String(b.title ?? cur.title),
    img: String(b.img ?? cur.img),
    href: String(b.href ?? cur.href),
    alt: String(b.alt ?? cur.alt ?? ''),
    active: b.active ?? cur.active,
    order: Number.isFinite(b.order) ? Number(b.order) : cur.order,
  }
  await fsp.writeFile(FILE, JSON.stringify(list, null, 2))
  return list[i]
})
