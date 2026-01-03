import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { label, line1, line2, city, state, zipCode, country, isDefault } = await request.json()

    const existing = await prisma.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: auth.userId }, data: { isDefault: false } })
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        label: label ?? existing.label,
        line1: line1 ?? existing.line1,
        line2: line2 ?? existing.line2,
        city: city ?? existing.city,
        state: state ?? existing.state,
        zipCode: zipCode ?? existing.zipCode,
        country: country ?? existing.country,
        isDefault: isDefault ?? existing.isDefault,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update address:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.address.delete({ where: { id } })
    return NextResponse.json({ message: 'Address deleted' })
  } catch (error) {
    console.error('Failed to delete address:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
