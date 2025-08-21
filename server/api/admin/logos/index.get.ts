import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

export default defineEventHandler(async () => {
  try {
    return await readJson('logos.json')
  } catch {
    await writeJson('logos.json', [])
    return []
  }
})
