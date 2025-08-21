import { defineEventHandler, readBody, createError } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event) || {}
  if (!body.src) throw createError({ statusCode: 400, statusMessage: 'src обязателен' })

  const list = await readJson('logos.json').catch(() => [])
  const nextId = (list.reduce((m, s) => Math.max(m, Number(s?.id)||0), 0) + 1)

  const item = {
    id: nextId,
    src: String(body.src).trim(),
    alt: String(body.alt || '').trim(),
    href: String(body.href || '').trim()
  }
  list.push(item)
  await writeJson('logos.json', list)
  return item
})
