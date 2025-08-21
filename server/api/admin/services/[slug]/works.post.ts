import { promises as fsp } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const file = join(process.cwd(), 'server/data/services-works', `${slug}.json`)
  const b = (await readBody(event)) || {}

  let list: any[] = []
  try { list = JSON.parse((await fsp.readFile(file)).toString()) } catch {
    await fsp.mkdir(dirname(file), { recursive: true })
  }

  const item: any = {
    id: randomUUID(),
    title: String(b.title ?? '').trim(),
    price: Number(b.price ?? 0),
    oldPrice: b.oldPrice != null ? Number(b.oldPrice) : null,
    note: b.note ? String(b.note) : null,
    active: b.active !== false,
    order: list.length ? Math.max(...list.map(x=>x.order ?? 0)) + 1 : 1,
    updatedAt: new Date().toISOString(),
  }
  if (!item.title) throw createError({ statusCode: 400, statusMessage: 'title required' })

  list.push(item)
  await fsp.writeFile(file, JSON.stringify(list, null, 2))
  return item
})
