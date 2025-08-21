import { promises as fsp } from 'node:fs'
import { join } from 'node:path'


export default defineEventHandler(async (event) => {
  const { slug, id } = getRouterParams(event)
  const file = join(process.cwd(), 'server/data/services-works', `${slug}.json`)
  const list: any[] = JSON.parse((await fsp.readFile(file)).toString())
  const i = list.findIndex(x => x.id === id)
  if (i < 0) throw createError({ statusCode: 404, statusMessage: 'not found' })
  const b = (await readBody(event)) || {}

  list[i] = {
    ...list[i],
    title: b.title != null ? String(b.title) : list[i].title,
    price: b.price != null ? Number(b.price) : list[i].price,
    oldPrice: b.oldPrice === null ? null : (b.oldPrice != null ? Number(b.oldPrice) : list[i].oldPrice),
    note: b.note === null ? null : (b.note != null ? String(b.note) : list[i].note),
    active: b.active ?? list[i].active,
    order: Number.isFinite(b.order) ? Number(b.order) : list[i].order,
    updatedAt: new Date().toISOString(),
  }
  await fsp.writeFile(file, JSON.stringify(list, null, 2))
  return list[i]
})
