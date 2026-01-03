import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // Support multiple possible keys sent from client: items, guestCartItems, pendingCart
    const guestCartItems = body?.items || body?.guestCartItems || body?.pendingCart || []

    if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      return NextResponse.json({ message: 'No items to merge' })
    }

    const mergedItems = []

    for (const guestItem of guestCartItems) {
      const { productId, quantity, sizeVariantId } = guestItem

      // Check if this item already exists in user's cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId_sizeVariantId: {
            userId: auth.userId,
            productId,
            sizeVariantId: sizeVariantId || null
          }
        }
      })

      if (existingItem) {
        // Update quantity
        const updated = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { product: true }
        })
        mergedItems.push(updated)
      } else {
        // Create new cart item
        const newItem = await prisma.cartItem.create({
          data: {
            userId: auth.userId,
            productId,
            quantity,
            sizeVariantId: sizeVariantId || null
          },
          include: { product: true }
        })
        mergedItems.push(newItem)
      }
    }

    return NextResponse.json({
      message: 'Cart merged successfully',
      items: mergedItems,
      itemCount: mergedItems.length
    })
  } catch (error) {
    console.error('Failed to merge cart:', error)
    return NextResponse.json({ error: 'Failed to merge cart' }, { status: 500 })
  }
}
