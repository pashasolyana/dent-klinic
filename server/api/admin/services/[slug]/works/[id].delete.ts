import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const { slug, id } = getRouterParams(event)
  const file = join(process.cwd(), 'server/data/services-works', `${slug}.json`)
  const list: any[] = JSON.parse((await fsp.readFile(file)).toString())
  const next = list.filter(x => x.id !== id)
  await fsp.writeFile(file, JSON.stringify(next, null, 2))
  return { ok: true }
})
