import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

export default defineEventHandler(async () => {
  try {
    return await readJson<any>('sales.json')
  } catch {
    const def: any = {
      title: 'Акции',
      textHtml: 'Мы с радостью представляем вам уникальные акции, которые проводятся в нашей клинике. <a href="#contacts" class="sales__link">Позаботьтесь о своём здоровье</a> и красоте зубов, воспользовавшись привлекательными предложениями, которые мы специально создали для вас.',
      updatedAt: new Date().toISOString()
    }
    await writeJson('sales.json', def)
    return def
  }
})
