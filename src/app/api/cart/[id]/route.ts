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

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { sizeVariant: true },
    })
    if (!cartItem || cartItem.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Validate against available stock
    if (cartItem.dealProductId) {
      const dp = await prisma.dealProduct.findUnique({ where: { id: cartItem.dealProductId } })
      if (dp) {
        const svs = dp.sizeVariants as Array<{ size: string; quantity: number }>
        const sv = svs.find(s => s.size === cartItem.size)
        if (sv && quantity > sv.quantity) {
          return NextResponse.json({
            error: `Only ${sv.quantity} unit${sv.quantity === 1 ? '' : 's'} available in size UK ${cartItem.size}`,
            max: sv.quantity,
          }, { status: 400 })
        }
      }
    } else if (cartItem.sizeVariant) {
      if (quantity > cartItem.sizeVariant.quantity) {
        return NextResponse.json({
          error: `Only ${cartItem.sizeVariant.quantity} unit${cartItem.sizeVariant.quantity === 1 ? '' : 's'} available in this size`,
          max: cartItem.sizeVariant.quantity,
        }, { status: 400 })
      }
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: { include: { sizeVariants: true } },
        sizeVariant: true,
        dealProduct: true,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update cart item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
