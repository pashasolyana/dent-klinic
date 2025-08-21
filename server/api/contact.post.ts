import { z } from 'zod'
import { sendMail } from '~/server/utils/mailer'
import { assertRateLimit } from '~/server/utils/rateLimit'

const BodySchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().min(5).max(30),
  message: z.string().min(1).max(5000),
  consent: z.boolean().refine(v => v === true, 'Нужно согласие на обработку ПДн'),

  // анти‑спам поля
  hp_company: z.string().optional(),   // honeypot — должно быть пустым
  t: z.number().int()                  // unix ms, когда форма отрендерилась
})

export default defineEventHandler(async (event) => {
  const bodyRaw = await readBody(event).catch(() => ({}))
  const data = BodySchema.safeParse(bodyRaw)
  if (!data.success) {
    throw createError({ statusCode: 400, statusMessage: 'Неверные данные', data: data.error.flatten() })
  }
  const b = data.data

  // 1) Honeypot — боты часто заполняют скрытые поля
  if (b.hp_company && b.hp_company.trim() !== '') {
    throw createError({ statusCode: 400, statusMessage: 'Spam detected (hp)' })
  }

  // 2) Минимальное время заполнения (>= 3 сек) и срок годности формы (<= 20 мин)
  const now = Date.now()
  if (now - b.t < 3000) {
    throw createError({ statusCode: 400, statusMessage: 'Слишком быстро отправлено' })
  }
  if (now - b.t > 20 * 60 * 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Форма устарела, обновите страницу' })
  }

  // 3) Rate limit: 1 заявка в 5 минут с одного IP
  const ip = getRequestIP(event) || getRequestHeader(event, 'x-forwarded-for') || 'unknown'
  await assertRateLimit(`contact:${ip}`, 5 * 60 * 1000)

  // 4) Отправка письма
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">
      <h2>Заявка с сайта</h2>
      <p><b>Имя:</b> ${escapeHtml(b.name)}</p>
      <p><b>Телефон:</b> ${escapeHtml(b.phone)}</p>
      <p><b>Комментарий:</b><br/>${escapeHtml(b.message).replace(/\n/g,'<br/>')}</p>
      <hr/>
      <p style="color:#888">IP: ${escapeHtml(String(ip))}</p>
      <p style="color:#888">Отправлено: ${new Date().toISOString()}</p>
    </div>
  `
  await sendMail({
    to: process.env.MAIL_USER!, // свой ящик
    subject: `🦷 Новая заявка: ${b.name} (${b.phone})`,
    html,
    text: html.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ')
  })

  return { ok: true }
})

function escapeHtml(str: string) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
