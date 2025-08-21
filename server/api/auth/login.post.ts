import {
  defineEventHandler,
  readBody,
  createError,
  getRequestHeader,
  getRequestIP
} from 'h3'
import { timingSafeEqual } from 'node:crypto'
import {
  setAdminCookie,
  ensureLoginNotLocked,
  registerLoginFailure,
  registerLoginSuccess,
  assertRateLimit
} from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // 0) Мягкий RL: не чаще одного запроса раз в 3 сек с IP
  const ip = getRequestIP(event) || 'unknown'
  await assertRateLimit(`admin-login:soft:${ip}`, 3000)

  // 1) Если уже залочен — 429
  await ensureLoginNotLocked(event)

  // 2) Требуем JSON
  const ct = getRequestHeader(event, 'content-type') || ''
  if (!ct.startsWith('application/json')) {
    await registerLoginFailure(event)
    throw createError({ statusCode: 415, statusMessage: 'Unsupported Media Type' })
  }

  const body = await readBody<{ password?: string }>(event)
  if (!body?.password) {
    await registerLoginFailure(event)
    throw createError({ statusCode: 400, statusMessage: 'Пароль обязателен' })
  }

  const { admin } = useRuntimeConfig(event)
  const expected = admin.password ?? ''
  if (!expected) {
    throw createError({ statusCode: 500, statusMessage: 'Пароля нет' })
  }

  // сравнение константного времени
  const given = Buffer.from(body.password.trim(), 'utf8')
  const exp = Buffer.from(expected.trim(), 'utf8')
  const equal =
    given.length === exp.length &&
    timingSafeEqual(given, exp)

  if (!equal) {
    await registerLoginFailure(event)
    throw createError({ statusCode: 401, statusMessage: 'Некорректный пароль' })
  }

  await registerLoginSuccess(event)
  setAdminCookie(event)
  return { ok: true }
})