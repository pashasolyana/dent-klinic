import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

const FILE = join(process.cwd(), 'server/data/services.json')

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const list: any[] = JSON.parse((await fsp.readFile(FILE)).toString())
  const next = list.filter(x => x.slug !== slug)
  await fsp.writeFile(FILE, JSON.stringify(next, null, 2))
  return { ok: true }
})
