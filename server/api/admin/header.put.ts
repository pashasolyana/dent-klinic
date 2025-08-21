import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { readJson, writeJson } from '~/server/utils/jsondb'

interface HeaderConfig {
  social: { whatsappUrl: string; telegramUrl: string }
  updatedAt: string
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody<Partial<HeaderConfig>>(event)
  const current = await readJson<HeaderConfig>('header.json').catch(() => ({
    social: { whatsappUrl: '', telegramUrl: '' },
    updatedAt: ''
  } as HeaderConfig))

  const wa = body.social?.whatsappUrl ?? current.social.whatsappUrl
  const tg = body.social?.telegramUrl ?? current.social.telegramUrl

  const validate = (s: string, allowed: string[]) => {
    try {
      const u = new URL(s)
      const ok = allowed.some(d => u.hostname === d || u.hostname.endsWith(`.${d}`))
      if (!ok) throw new Error('domain')
      return u.toString()
    } catch {
      throw createError({ statusCode: 400, statusMessage: `Invalid URL: ${s}` })
    }
  }

  const next: HeaderConfig = {
    social: {
      whatsappUrl: validate(wa, ['wa.me']),
      telegramUrl: validate(tg, ['t.me'])
    },
    updatedAt: new Date().toISOString()
  }

  await writeJson('header.json', next)
  return next
})
