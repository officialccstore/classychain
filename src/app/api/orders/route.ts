import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { decrementStock, InsufficientStockError, StockCheckItem } from '@/lib/stock'

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, totalPrice, shippingAddress } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const stockItems: StockCheckItem[] = items.map((item: any) => ({
      cartItemId: item.id,
      productId: item.productId || null,
      dealProductId: item.dealProductId || (item.isDeal ? item.productId : null),
      sizeVariantId: item.sizeVariantId || null,
      size: item.size || null,
      quantity: item.quantity,
    }))

    let order
    try {
      order = await prisma.$transaction(async (tx: any) => {
        await decrementStock(tx, stockItems)

        return tx.order.create({
          data: {
            userId: auth.userId,
            totalPrice,
            shippingAddress,
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                itemName: item.product?.name || null,
                itemImage: item.product?.image || null,
                itemBrand: item.product?.brand || null,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: { items: { include: { product: true } } },
        })
      })
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        return NextResponse.json({ error: 'Some items in your order are no longer available', issues: err.issues }, { status: 409 })
      }
      throw err
    }

    // Clear cart for this user after order
    await prisma.cartItem.deleteMany({ where: { userId: auth.userId } })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')

    const targetUserId = auth.role === 'admin' && requestedUserId ? requestedUserId : auth.userId

    const orders = await prisma.order.findMany({
      where: { userId: targetUserId },
      include: { items: { include: { product: { select: { id: true, name: true, image: true } } } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
