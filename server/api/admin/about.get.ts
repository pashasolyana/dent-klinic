import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'


export default defineEventHandler(async () => {
  try {
    return await readJson<any>('about.json')
  } catch {
    const def: any = {
      title: 'О клинике',
      text: 'Наша клиника – не просто место, где люди получают стоматологическую помощь.\nЭто особое пространство, где соединяется наука, искусство и трудолюбие.',
      ctaLabel: 'Узнать больше',
      ctaHref: '/o-klinike',
      updatedAt: new Date().toISOString()
    }
    await writeJson('about.json', def)
    return def
  }
})
