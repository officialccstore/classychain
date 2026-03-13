import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromReq, verifyToken } from '@/lib/auth'

// Update the logged-in admin's name
export async function PATCH(request: Request) {
  try {
    const token = getTokenFromReq(request as any)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: payload.id },
      data: { name: name.trim() },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
