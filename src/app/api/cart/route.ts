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
      where: { userId: auth.userId },
      include: {
        product: { include: { sizeVariants: true } },
        sizeVariant: true,
        dealProduct: true,
      },
      orderBy: { createdAt: 'desc' },
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

    const body = await request.json()
    const { productId, quantity = 1, sizeVariantId, size, color, dealProductId } = body

    // ── DEAL PRODUCT PATH ──────────────────────────────────────────────────────
    if (dealProductId) {
      if (!size) {
        return NextResponse.json({ error: 'Size is required for deal products' }, { status: 400 })
      }

      const dealProduct = await prisma.dealProduct.findUnique({ where: { id: dealProductId } })
      if (!dealProduct) {
        return NextResponse.json({ error: 'Deal product not found' }, { status: 404 })
      }

      const sizeVariants = dealProduct.sizeVariants as Array<{ size: string; quantity: number }>
      const sv = sizeVariants.find(s => s.size === size)
      if (!sv || sv.quantity === 0) {
        return NextResponse.json({ error: `Size ${size} is not available` }, { status: 400 })
      }

      const existing = await prisma.cartItem.findFirst({
        where: { userId: auth.userId, dealProductId, size },
      })
      const inCart = existing?.quantity ?? 0
      const newQty = inCart + Number(quantity)

      if (newQty > sv.quantity) {
        return NextResponse.json({
          error: `Only ${sv.quantity} unit${sv.quantity === 1 ? '' : 's'} available in size UK ${size}. You already have ${inCart} in cart.`,
          max: sv.quantity,
          inCart,
        }, { status: 400 })
      }

      let cartItem
      if (existing) {
        cartItem = await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
          include: { dealProduct: true },
        })
      } else {
        cartItem = await prisma.cartItem.create({
          data: { userId: auth.userId, dealProductId, size, quantity: Number(quantity) },
          include: { dealProduct: true },
        })
      }
      return NextResponse.json(cartItem, { status: 201 })
    }

    // ── REGULAR PRODUCT PATH ───────────────────────────────────────────────────
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    // Validate quantity against stock
    if (sizeVariantId) {
      const sv = await prisma.sizeVariant.findUnique({ where: { id: sizeVariantId } })
      if (sv) {
        const existing = await prisma.cartItem.findFirst({
          where: { userId: auth.userId, productId, sizeVariantId },
        })
        const inCart = existing?.quantity ?? 0
        const newQty = inCart + Number(quantity)
        if (newQty > sv.quantity) {
          return NextResponse.json({
            error: `Only ${sv.quantity} unit${sv.quantity === 1 ? '' : 's'} available in this size. You already have ${inCart} in cart.`,
            max: sv.quantity,
            inCart,
          }, { status: 400 })
        }
      }
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: auth.userId,
        productId,
        sizeVariantId: sizeVariantId || null,
        size: size || null,
        color: color || null,
      },
    })

    let cartItem
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: Number(quantity) } },
        include: { product: { include: { sizeVariants: true } }, sizeVariant: true },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: auth.userId,
          productId,
          quantity: Number(quantity),
          sizeVariantId: sizeVariantId || null,
          size: size || null,
          color: color || null,
        },
        include: { product: { include: { sizeVariants: true } }, sizeVariant: true },
      })
    }

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Failed to add to cart:', error)
    return NextResponse.json({
      error: 'Failed to add to cart',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
