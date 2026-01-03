import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import { signToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create user (role defaults to 'user')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Create JWT token
    const token = signToken({ id: user.id, email: user.email, role: user.role })

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
