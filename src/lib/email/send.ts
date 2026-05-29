import { Resend } from 'resend'

// EMAIL_FROM es el estándar del proyecto (dominio verificado en Resend)
const FROM = process.env.EMAIL_FROM || process.env.RESEND_FROM || 'RUTA34 Telecom <hola@esimruta34.com>'

export async function sendEmail(to: string | string[], subject: string, html: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })
    if (error) console.error('Email error:', error)
    return { data, error }
  } catch (err) {
    console.error('Send email failed:', err)
    return { error: err }
  }
}