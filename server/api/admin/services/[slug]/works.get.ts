import { promises as fsp } from 'node:fs'
import { dirname, join } from 'node:path'

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const file = join(process.cwd(), 'server/data/services-works', `${slug}.json`)
  try {
    const buf = await fsp.readFile(file)
    const arr = JSON.parse(buf.toString()) as any[]
    return arr.sort((a,b)=>a.order-b.order)
  } catch {
    await fsp.mkdir(dirname(file), { recursive: true })
    await fsp.writeFile(file, JSON.stringify([], null, 2))
    return [] as any[]
  }
})
