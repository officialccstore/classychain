import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromReq, verifyToken } from '@/lib/auth'

const ORDER_STATUSES = ['accepted', 'packaging', 'shipped', 'delivered']

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

    const { status } = await request.json()

    if (!status || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: { include: { product: true } } },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to update order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
