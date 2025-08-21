import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

export default defineEventHandler(async () => {
  try {
    return await readJson('promo.json')
  } catch {
    await writeJson('promo.json', [])
    return []
  }
})
