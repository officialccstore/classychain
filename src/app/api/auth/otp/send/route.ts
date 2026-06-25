import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOtpSms } from '@/lib/sms'

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 })
    }

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate any existing unused OTPs for this phone
    await prisma.otpVerification.updateMany({
      where: { phone, used: false },
      data: { used: true },
    })

    await prisma.otpVerification.create({
      data: { phone, code: otp, expiresAt },
    })

    await sendOtpSms(phone, otp)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('OTP send error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 })
  }
}
