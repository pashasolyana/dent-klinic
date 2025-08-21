import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

interface HeaderConfig {
  social: { whatsappUrl: string; telegramUrl: string }
  updatedAt: string
}

export default defineEventHandler(async () => {
  try {
    return await readJson<HeaderConfig>('header.json')
  } catch {
    const def: HeaderConfig = {
      social: {
        whatsappUrl: 'https://wa.me/79777876837',
        telegramUrl: 'https://t.me/+79777876837'
      },
      updatedAt: new Date().toISOString()
    }
    await writeJson('header.json', def)
    return def
  }
})
