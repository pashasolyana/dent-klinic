import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const id = String(q.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id обязателен' })

  const list = await readJson('doctors.json').catch(() => [])
  const arr = Array.isArray(list) ? list : []

  const before = arr.length
  const next = arr.filter(d => d?.id !== id)
  if (next.length === before) throw createError({ statusCode: 404, statusMessage: 'Врач не найден' })

  await writeJson('doctors.json', next)
  return { ok: true }
})
