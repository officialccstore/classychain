import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromReq, verifyToken } from '@/lib/auth'

const ORDER_STATUSES = ['pending', 'accepted', 'packaging', 'shipped', 'delivered', 'cancelled']

function isAdminFromReq(req: any) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdminFromReq(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, trackingId } = body

    const updateData: any = {}

    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (trackingId !== undefined) {
      updateData.trackingId = trackingId
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true, phone: true, address: true, city: true, state: true, zipCode: true, country: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
