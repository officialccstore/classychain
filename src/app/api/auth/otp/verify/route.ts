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

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { used: true },
    })

    // Find or create user by phone
    let user = await prisma.user.findFirst({ where: { phone } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: 'ClassyChain User',
        },
      })
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
      token,
    })
  } catch (error: any) {
    console.error('OTP verify error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
