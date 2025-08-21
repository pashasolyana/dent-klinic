import { defineEventHandler } from 'h3'
import { readJson } from '~/server/utils/jsondb'

export default defineEventHandler(async () => {
  const list = await readJson('doctors.json').catch(() => [])
  const arr = Array.isArray(list) ? list : []
  arr.sort((a, b) => (a?.order ?? 999) - (b?.order ?? 999) || String(a?.name || '').localeCompare(String(b?.name || '')))
  return arr
})
