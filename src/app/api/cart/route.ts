import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { user: { is: { id: auth.userId } } },
      include: { product: true, sizeVariant: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity, sizeVariantId } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing productId or quantity' }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_sizeVariantId: {
          userId: auth.userId,
          productId,
          sizeVariantId: sizeVariantId || null,
        },
      },
      update: { quantity: { increment: quantity } },
      create: {
        userId: auth.userId,
        productId,
        quantity,
        sizeVariantId: sizeVariantId || null,
      },
      include: { product: true, sizeVariant: true },
    })
    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Failed to add to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
