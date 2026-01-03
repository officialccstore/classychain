import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

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
    
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({ where: { id } })
    if (!cartItem || cartItem.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.cartItem.delete({ where: { id } })
    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Failed to remove item from cart:', error)
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
  }
}

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
    const { quantity } = await request.json()

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({ where: { id } })
    if (!cartItem || cartItem.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update cart item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
