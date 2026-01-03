import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: auth.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { label, line1, line2, city, state, zipCode, country, isDefault } = await request.json()

    if (!line1 || !city || !state || !zipCode || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: auth.userId }, data: { isDefault: false } })
    }

    const address = await prisma.address.create({
      data: {
        userId: auth.userId,
        label: label || 'Home',
        line1,
        line2: line2 || null,
        city,
        state,
        zipCode,
        country,
        isDefault: !!isDefault,
      },
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error('Failed to create address:', error)
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}
