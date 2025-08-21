import { promises as fsp } from 'node:fs'
import { join, dirname } from 'node:path'

const FILE = join(process.cwd(), 'server', 'data', 'o-klinike.json')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Bad body' })
  }

  // простая нормализация полей (необязательная, но помогает)
  const payload = {
    heroTitle: String(body.heroTitle ?? ''),
    foundationTitle: String(body.foundationTitle ?? ''),
    foundationParagraph1: String(body.foundationParagraph1 ?? ''),
    foundationParagraph2: String(body.foundationParagraph2 ?? ''),
    yearsText: String(body.yearsText ?? ''),
    goals: Array.isArray(body.goals) ? body.goals : [],
    prioritiesTitle: String(body.prioritiesTitle ?? ''),
    prioritiesP1: String(body.prioritiesP1 ?? ''),
    prioritiesP2: String(body.prioritiesP2 ?? ''),
    whyTitle: String(body.whyTitle ?? ''),
    whyText: String(body.whyText ?? ''),
    priorityImage: body.priorityImage ?? '',
    goalsBackground: body.goalsBackground ?? '',
    heroYearsCardImage: body.heroYearsCardImage ?? '',
    seoTitle: String(body.seoTitle ?? ''),
    seoDescription: String(body.seoDescription ?? '')
  }

  const saved = { ...payload, updatedAt: new Date().toISOString() }

  await fsp.mkdir(dirname(FILE), { recursive: true })
  await fsp.writeFile(FILE, JSON.stringify(saved, null, 2), 'utf8')

  // не кэшируем ответ
  event.node.res.setHeader('Cache-Control', 'no-store')

  return saved
})
