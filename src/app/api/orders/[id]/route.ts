import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (action === 'cancel') {
      if (!['pending', 'accepted'].includes(order.status)) {
        return NextResponse.json({ error: 'Order cannot be cancelled at this stage' }, { status: 400 })
      }
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: 'cancelled' },
        include: { items: { include: { product: true } } },
      })
      return NextResponse.json(updated)
    }

    if (action === 'return') {
      if (order.status !== 'delivered') {
        return NextResponse.json({ error: 'Only delivered orders can be returned' }, { status: 400 })
      }
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: 'return_requested' },
        include: { items: { include: { product: true } } },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
