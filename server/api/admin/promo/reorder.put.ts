import { defineEventHandler, readBody, createError } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler( async (event) => {
  requireAdmin(event)
  const body = await readBody(event) || {}
  const order = Array.isArray(body.order) ? body.order.map(Number) : null
  if (!order || !order.length) {
    throw createError({ statusCode: 400, statusMessage: 'order: number[] required' })
  }
  const list = await readJson('promo.json').catch(() => [])
  // проверим, что все id присутствуют
  const ids = new Set(list.map((s:any)=>Number(s.id)))
  for (const id of order) if (!ids.has(id)) {
    throw createError({ statusCode: 400, statusMessage: `unknown id in order: ${id}` })
  }
  const map = new Map(list.map((s:any)=>[Number(s.id), s]))
  const next = order.map((id:number)=> map.get(id))
  await writeJson('promo.json', next)
  return { ok: true, count: next.length }
})
