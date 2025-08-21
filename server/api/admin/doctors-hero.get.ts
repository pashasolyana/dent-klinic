import { promises as fsp } from 'node:fs'
import { dirname, join } from 'node:path'

const FILE = join(process.cwd(), 'server/data/doctors-hero.json')

const DEFAULTS = {
  title: 'Врачи',
  subtitle:
    'Наши врачи — настоящие профессионалы своего дела, обладающие многолетним опытом и глубокими знаниями в области стоматологии.',
  ctaText: 'Подробнее',
  ctaHref: '/vrachi',
  showCta: true,
  bgUrl: '/images/bg.png',
}

export default defineEventHandler(async () => {
  try {
    const buf = await fsp.readFile(FILE)
    const data = JSON.parse(buf.toString())
    return { ...DEFAULTS, ...data }
  } catch {
    await fsp.mkdir(dirname(FILE), { recursive: true })
    await fsp.writeFile(FILE, JSON.stringify(DEFAULTS, null, 2))
    return DEFAULTS
  }
})
