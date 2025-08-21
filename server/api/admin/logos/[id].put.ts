import { defineEventHandler, readBody, createError } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = Number(event.context.params.id)
  const patch = await readBody(event) || {}

  const list = await readJson('logos.json').catch(() => [])
  const idx = list.findIndex((s:any) => Number(s.id) === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Logo not found' })

  const cur = list[idx]
  const next = {
    ...cur,
    src: String(patch.src ?? cur.src ?? '').trim(),
    alt: String(patch.alt ?? cur.alt ?? ''),
    href: String(patch.href ?? cur.href ?? '')
  }
  list[idx] = next
  await writeJson('logos.json', list)
  return next
})
