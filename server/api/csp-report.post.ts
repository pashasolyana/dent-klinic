import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) // браузер шлёт { "csp-report": {...} }
    console.warn('[CSP-Report]', JSON.stringify(body))
  } catch (e) {
    // ignore
  }
  return { ok: true }
})
