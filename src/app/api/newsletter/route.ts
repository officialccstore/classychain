import { NextResponse } from 'next/server'
import { sendNewsletterNotification } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendNewsletterNotification(email)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
