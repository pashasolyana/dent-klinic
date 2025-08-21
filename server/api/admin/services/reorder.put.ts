import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

const FILE = join(process.cwd(), 'server/data/services.json')

export default defineEventHandler(async (event) => {
  const slugs = (await readBody<string[]>(event)) || []
  if (!Array.isArray(slugs)) throw createError({ statusCode: 400, statusMessage: 'array expected' })
  const list: any[] = JSON.parse((await fsp.readFile(FILE)).toString())
  const map = new Map(slugs.map((s,i) => [s, i+1]))
  for (const it of list) it.order = map.get(it.slug) ?? it.order
  list.sort((a,b)=>a.order-b.order)
  await fsp.writeFile(FILE, JSON.stringify(list, null, 2))
  return list
})
