import nodemailer, { type Transporter } from 'nodemailer'

let _transporter: Transporter | null = null

function createTransporter() {
  const { mail } = useRuntimeConfig()

  if (!mail?.host || !mail?.user || !mail?.pass) {
    throw new Error('Mail config is missing. Check runtimeConfig and .env')
  }

  return nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.secure, // true for 465, false for 587
    auth: {
      user: mail.user,
      pass: mail.pass
    }
  })
}

export function getMailer(): Transporter {
  if (_transporter) return _transporter
  _transporter = createTransporter()
  return _transporter
}

export type SendMailInput = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename?: string
    content?: string | Buffer
    path?: string
    contentType?: string
  }>
}

export async function sendMail(input: SendMailInput) {
  const { mail } = useRuntimeConfig()
  const transporter = getMailer()

  // По желанию: проверка соединения (один раз при первом старте)
  // await transporter.verify()

  const message = {
    from: mail.from || mail.user,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
    attachments: input.attachments
  }

  const info = await transporter.sendMail(message)
  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response
  }
}
