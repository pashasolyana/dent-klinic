import { promises as fsp } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

const FILE = join(process.cwd(), 'server', 'data', 'o-klinike.json')

export default defineEventHandler(async (event) => {
  // не кэшируем в браузере/CDN
  event.node.res.setHeader('Cache-Control', 'no-store')

  try {
    const buf = await fsp.readFile(FILE)
    return JSON.parse(buf.toString())
  } catch {
    // дефолтные значения — чтобы админ смог всё заполнить
    return {
      heroTitle: 'О клинике',
      foundationTitle: 'Основание',
      foundationParagraph1: '',
      foundationParagraph2: '',
      yearsText: '17 лет',
      goals: [{ id: randomUUID(), text: '' }],
      prioritiesTitle: 'Приоритеты',
      prioritiesP1: '',
      prioritiesP2: '',
      whyTitle: 'Почему мы?',
      whyText: '',
      priorityImage: '',
      goalsBackground: '',
      heroYearsCardImage: '',
      seoTitle: 'О клинике',
      seoDescription: '',
      updatedAt: new Date().toISOString()
    }
  }
})
