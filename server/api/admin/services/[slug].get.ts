import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const file = join(process.cwd(), 'server/data/services-works', `${slug}.json`)
  try {
    const buf = await fsp.readFile(file)
    const arr = JSON.parse(buf.toString()) as any[]
    return (arr || []).filter(w => w.active !== false).sort((a,b) => a.order - b.order)
  } catch {
    return [] as any[]
  }
})
