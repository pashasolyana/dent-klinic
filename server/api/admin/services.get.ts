import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

const FILE = join(process.cwd(), 'server/data/services.json')

export default defineEventHandler(async () => {
  try {
    const buf = await fsp.readFile(FILE)
    const arr = JSON.parse(buf.toString()) as any[]
    return (arr || []).filter(x => x.active !== false).sort((a,b) => a.order - b.order)
  } catch {
    return [] as any[]
  }
})
