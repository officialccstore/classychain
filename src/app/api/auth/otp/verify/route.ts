import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 })
    }

    const record = await prisma.otpVerification.findFirst({
      where: { phone, code: otp, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { used: true },
    })

    const existingUser = await prisma.user.findUnique({ where: { phone } })

    if (existingUser) {
      const token = signToken({ id: existingUser.id, email: existingUser.email, role: existingUser.role })
      return NextResponse.json({
        user: { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role, phone: existingUser.phone },
        token,
      })
    }

    // New user — issue a short-lived setup token; account created after profile step
    const setupToken = signToken({ phone, purpose: 'setup' }, '15m')
    return NextResponse.json({ isNewUser: true, setupToken })
  } catch (error: any) {
    console.error('OTP verify error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
