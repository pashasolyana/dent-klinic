import { promises as fsp } from 'node:fs'
import { join } from 'node:path'


export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const ids: string[] = (await readBody(event)) || []
  const file = join(process.cwd(), 'server/data/services-works', `${slug}.json`)
  const list: any[] = JSON.parse((await fsp.readFile(file)).toString())
  const map = new Map(ids.map((id,i)=>[id, i+1]))
  for (const it of list) it.order = map.get(it.id) ?? it.order
  list.sort((a,b)=>a.order - b.order)
  await fsp.writeFile(file, JSON.stringify(list, null, 2))
  return list
})
