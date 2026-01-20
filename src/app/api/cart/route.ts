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

    const { productId, quantity, sizeVariantId, size } = await request.json()
    
    console.log('Cart POST - received:', { productId, quantity, sizeVariantId, size, userId: auth.userId })

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing productId or quantity' }, { status: 400 })
    }

    // Find existing cart item with same product, sizeVariant, and size
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: auth.userId,
        productId,
        sizeVariantId: sizeVariantId || null,
        size: size || null,
      },
    })
    
    console.log('Existing item:', existingItem)

    let cartItem
    if (existingItem) {
      // Update existing item
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
        include: { product: true, sizeVariant: true },
      })
    } else {
      // Create new item
      console.log('Creating new cart item with:', {
        userId: auth.userId,
        productId,
        quantity,
        sizeVariantId: sizeVariantId || null,
        size: size || null,
      })
      
      cartItem = await prisma.cartItem.create({
        data: {
          userId: auth.userId,
          productId,
          quantity,
          sizeVariantId: sizeVariantId || null,
          size: size || null,
        },
        include: { product: true, sizeVariant: true },
      })
    }
    
    console.log('Cart item created/updated:', cartItem)
    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Failed to add to cart - detailed error:', error)
    return NextResponse.json({ 
      error: 'Failed to add to cart', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
