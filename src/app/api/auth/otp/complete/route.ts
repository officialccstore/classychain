import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signToken, verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { setupToken, name, email } = await request.json()

    if (!setupToken) {
      return NextResponse.json({ error: 'Missing setup token' }, { status: 400 })
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const payload = verifyToken(setupToken)
    if (!payload || payload.purpose !== 'setup' || !payload.phone) {
      return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 })
    }

    const { phone } = payload

    // If user was somehow already created (e.g. double-submit), just log them in
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      const token = signToken({ id: existing.id, email: existing.email, role: existing.role })
      return NextResponse.json({
        user: { id: existing.id, email: existing.email, name: existing.name, role: existing.role, phone: existing.phone },
        token,
      })
    }

    const user = await prisma.user.create({
      data: {
        phone,
        name: name.trim(),
        email: email?.trim() || null,
      },
    })

    const token = signToken({ id: user.id, email: user.email, role: user.role })
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
      token,
    })
  } catch (error: any) {
    console.error('OTP complete error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
