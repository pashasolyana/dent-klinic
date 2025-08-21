import { promises as fsp } from 'node:fs'
import { dirname, join } from 'node:path'


const FILE = join(process.cwd(), 'server/data/services.json')

const ensure = async (): Promise<any[]> => {
  try {
    const buf = await fsp.readFile(FILE)
    return JSON.parse(buf.toString()) as any[]
  } catch {
    await fsp.mkdir(dirname(FILE), { recursive: true })
    await fsp.writeFile(FILE, JSON.stringify([], null, 2))
    return []
  }
}

export default defineEventHandler(async () => {
  const list = await ensure()
  return list.sort((a,b) => a.order - b.order)
})
