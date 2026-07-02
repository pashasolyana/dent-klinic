// Техническая фиксация согласия на обработку ПДн (дата, время, версия политики, IP) — требование 152-ФЗ.
export type ConsentRecord = {
  name: string
  phone: string
  ip: string
  userAgent: string
  consentAt: string
  policyVersion: string
}

export async function recordConsent(record: ConsentRecord) {
  const store = useStorage('consent')
  const safeTimestamp = record.consentAt.replace(/[:.]/g, '-')
  const key = `${safeTimestamp}-${Math.random().toString(36).slice(2, 8)}`
  await store.setItem(key, record)
}
