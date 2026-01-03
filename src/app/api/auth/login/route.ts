import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import { signToken } from '@/lib/auth'


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token (include role)
    const token = signToken({ id: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
