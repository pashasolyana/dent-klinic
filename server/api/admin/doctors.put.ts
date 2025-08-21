import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

function trimStr(v, max){ return String(v ?? '').trim().slice(0, max) }

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const id = String(q.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id обязателен' })

  const patch = await readBody(event) || {}
  const list = await readJson('doctors.json').catch(() => [])
  const arr = Array.isArray(list) ? list : []

  const i = arr.findIndex(d => d?.id === id)
  if (i === -1) throw createError({ statusCode: 404, statusMessage: 'Врач не найден' })

  const prev = arr[i]
  const next = {
    ...prev,
    ...(patch.name !== undefined ? { name: trimStr(patch.name, 160) } : {}),
    ...(patch.position !== undefined ? { position: trimStr(patch.position, 200) } : {}),
    ...(patch.description !== undefined ? { description: trimStr(patch.description, 2000) } : {}),
    ...(patch.photo !== undefined ? { photo: trimStr(patch.photo, 1000) } : {}),
    ...(patch.order !== undefined ? { order: Number.isFinite(+patch.order) ? +patch.order : prev.order } : {}),
    ...(patch.visible !== undefined ? { visible: !!patch.visible } : {}),
    updatedAt: new Date().toISOString()
  }

  arr[i] = next
  await writeJson('doctors.json', arr)
  return { ok: true, data: next }
})
