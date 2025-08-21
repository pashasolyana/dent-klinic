import { defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { readJson, writeJson } from '~/server/utils/jsondb'


export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const patch = await readBody<Partial<any>>(event)
  const cur = await readJson<any>('about.json')
  const next: any = {
    title: patch.title?.trim() ?? cur.title,
    text: patch.text ?? cur.text,
    ctaLabel: patch.ctaLabel?.trim() ?? cur.ctaLabel,
    ctaHref: patch.ctaHref?.trim() ?? cur.ctaHref,
    updatedAt: new Date().toISOString()
  }
  await writeJson('about.json', next)
  return next
})
