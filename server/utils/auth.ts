import { createHmac } from 'node:crypto'
import { H3Event, getCookie, setCookie, createError, getRequestIP } from 'h3'

/** Секреты всегда берём из runtimeConfig */
function getSecrets(event: H3Event) {
  const { admin } = useRuntimeConfig(event)
  return { secret: admin.secret, expectedPassword: admin.password }
}

interface TokenPayload { sub: string; exp: number }

function signPayload(p: TokenPayload, secret: string) {
  const body = Buffer.from(JSON.stringify(p)).toString('base64url')
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verifyTokenWithSecret(token: string | undefined, secret: string): TokenPayload | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  if (expected !== sig) return null
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload
  if (Date.now() > payload.exp) return null
  return payload
}

export function setAdminCookie(event: H3Event, days = 7) {
  const { secret } = getSecrets(event)
  const payload: TokenPayload = { sub: 'admin', exp: Date.now() + days * 864e5 }
  const token = signPayload(payload, secret)
  setCookie(event, 'admin', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  })
}

export function requireAdmin(event: H3Event) {
  const { secret } = getSecrets(event)
  const token = getCookie(event, 'admin')
  const ok = verifyTokenWithSecret(token, secret)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

export function isAdmin(event: H3Event) {
  const { secret } = getSecrets(event)
  const token = getCookie(event, 'admin')
  return !!verifyTokenWithSecret(token, secret)
}

/* ───────── Rate‑limit с бэк‑оффом ───────── */

type LoginRL = { count: number; windowReset: number; lockUntil: number }

const RL_NS = 'ratelimit:login'
const WINDOW_MS = 10 * 60 * 1000
const BACKOFFS = [5, 15, 60, 300, 900] // sec

function rlKey(event: H3Event) {
  // надёжнее, чем remoteAddress за прокси
  return getRequestIP(event) || 'unknown'
}

/** 429 если временно залочен */
export async function ensureLoginNotLocked(event: H3Event) {
  const store = useStorage(RL_NS)
  const key = rlKey(event)
  const now = Date.now()
  const rec = (await store.getItem<LoginRL>(key)) || null
  if (rec?.lockUntil && rec.lockUntil > now) {
    const sec = Math.ceil((rec.lockUntil - now) / 1000)
    throw createError({ statusCode: 429, statusMessage: `Слишком много запросов. Попробуйте через ${sec} сек.` })
  }
}

/** Неуспешная попытка: инкремент и бэк‑офф */
export async function registerLoginFailure(event: H3Event) {
  const store = useStorage(RL_NS)
  const key = rlKey(event)
  const now = Date.now()
  const rec = (await store.getItem<LoginRL>(key)) || { count: 0, windowReset: now + WINDOW_MS, lockUntil: 0 }

  if (now > rec.windowReset) {
    rec.count = 0
    rec.windowReset = now + WINDOW_MS
  }

  rec.count += 1
  const idx = Math.min(rec.count - 1, BACKOFFS.length - 1)
  rec.lockUntil = now + BACKOFFS[idx] * 1000

  await store.setItem(key, rec)
  setRLHeaders(event, rec)
}

/** Успех: сброс счётчика */
export async function registerLoginSuccess(event: H3Event) {
  const store = useStorage(RL_NS)
  const key = rlKey(event)
  await store.removeItem(key)
  setRLHeaders(event, { count: 0, windowReset: Date.now() + WINDOW_MS, lockUntil: 0 })
}

function setRLHeaders(event: H3Event, rec: LoginRL) {
  event.node.res.setHeader('X-LoginRL-Count', String(rec.count))
  event.node.res.setHeader('X-LoginRL-Window-Reset', String(Math.floor(rec.windowReset / 1000)))
  event.node.res.setHeader('X-LoginRL-Lock-Until', String(Math.floor(rec.lockUntil / 1000)))
}

/* ───────── Твой «раз в окно» RL (оставляем) ───────── */

export async function assertRateLimit(key: string, windowMs: number) {
  const store = useStorage('ratelimit')
  const now = Date.now()
  const rec = (await store.getItem<{ until: number }>(key)) || null
  if (rec && rec.until > now) {
    const sec = Math.ceil((rec.until - now) / 1000)
    throw createError({ statusCode: 429, statusMessage: `Слишком часто. Попробуйте через ${sec} сек.` })
  }
  await store.setItem(key, { until: now + windowMs })
}
