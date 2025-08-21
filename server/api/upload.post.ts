import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { promises as fsp } from 'node:fs'
import { resolve, extname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { requireAdmin } from '~/server/utils/auth'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])

function sanitizeBase(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80)
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'No multipart form-data' })

  const files = parts.filter(p => p.filename && p.data)
  if (!files.length) throw createError({ statusCode: 400, statusMessage: 'No files found' })

  const now = new Date()
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const root = resolve(process.cwd(), 'public', 'uploads', yyyy, mm)
  await fsp.mkdir(root, { recursive: true })

  const results: Array<{ url: string; name: string; size: number }> = []

  for (const f of files) {
    const ext = extname(f.filename!).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) {
      throw createError({ statusCode: 415, statusMessage: `Unsupported file type: ${ext}` })
    }
    const size = f.data.byteLength
    if (size > MAX_SIZE) {
      throw createError({ statusCode: 413, statusMessage: `File too large: ${(size / (1024*1024)).toFixed(2)}MB` })
    }

    const base = sanitizeBase(f.filename!.slice(0, -ext.length) || 'file')
    const safe = `${base}_${Date.now()}_${randomBytes(6).toString('hex')}${ext}`
    await fsp.writeFile(resolve(root, safe), f.data)

    results.push({ url: `/uploads/${yyyy}/${mm}/${safe}`, name: f.filename!, size })
  }

  return { files: results }
})
