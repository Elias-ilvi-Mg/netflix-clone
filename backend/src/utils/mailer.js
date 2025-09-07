import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter
if (process.env.SMTP_URL) {
  transporter = nodemailer.createTransport(process.env.SMTP_URL)
} else {
  // dev: stream to console
  transporter = {
    sendMail: async (opts) => {
      const out = `\n--- DEV MAIL ---\nTo: ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text || ''}\n${opts.html || ''}\n----------------\n`
      console.log(out)
      return { messageId: 'dev' }
    }
  }
}

export async function sendMail(to, subject, html, text) {
  const from = process.env.MAIL_FROM || 'no-reply@nclone.local'
  return transporter.sendMail({ from, to, subject, html, text })
}

export function appUrl(path = '/') {
  const base = process.env.APP_BASE_URL || env.clientOrigin || 'http://localhost:5183'
  return `${base.replace(/\/$/,'')}${path.startsWith('/') ? path : `/${path}`}`
}
