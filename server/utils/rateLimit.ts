// Простой rate limit на Nitro Storage (переживает перезапуски)
// Ключ — любой (например, ip/email). windowMs — окно блокировки.
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
