import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

function trimStr(v, max){ return String(v ?? '').trim().slice(0, max) }

export default defineEventHandler(async (event) => {
  const b = (await readBody(event)) || {}

  const name  = trimStr(b.name, 160)
  const photo = trimStr(b.photo, 1000)

  if (!name || !photo) {
    throw createError({ statusCode: 400, statusMessage: 'Поле name и photo обязательны' })
  }

  const item = {
    id: crypto.randomUUID(),
    name,
    position: trimStr(b.position, 200),
    description: trimStr(b.description, 2000),
    photo,
    order: Number.isFinite(+b.order) ? +b.order : 1000,
    visible: b.visible === false ? false : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const list = await readJson('doctors.json').catch(() => [])
  const arr = Array.isArray(list) ? list : []
  arr.push(item)
  await writeJson('doctors.json', arr)

  return { ok: true, data: item }
})
