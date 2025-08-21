import { defineEventHandler, createError } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler( async (event) => {
  requireAdmin(event)
  const id = Number(event.context.params.id)
  const list = await readJson('promo.json').catch(() => [])
  const idx = list.findIndex((s:any) => Number(s.id) === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Slide not found' })
  const [removed] = list.splice(idx, 1)
  await writeJson('promo.json', list)
  return { ok: true, removed }
})
