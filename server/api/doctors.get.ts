import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const visibleOnly = q.visible === '1' || q.visible === 'true'

  try {
    const list = await readJson('doctors.json')
    const arr = Array.isArray(list) ? list : []
    const filtered = visibleOnly ? arr.filter(d => d && d.visible !== false) : arr
    filtered.sort((a, b) => (a?.order ?? 999) - (b?.order ?? 999) || String(a?.name || '').localeCompare(String(b?.name || '')))
    return filtered
  } catch {
    // seed, если файла нет
    const seed = [
      {
        id: crypto.randomUUID(),
        name: 'Иванова Ольга Сергеевна',
        position: 'Стоматолог‑терапевт',
        description: 'Эстетическая реставрация, эндодонтия, более 8 лет практики.',
        photo: '/images/doctors/ivanova.jpg',
        order: 10,
        visible: true,
        updatedAt: new Date().toISOString()
      }
    ]
    await writeJson('doctors.json', seed)
    return seed
  }
})
