import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { sendOrderEmail } from '@/lib/email'
import { generateInvoicePdf } from '@/lib/invoice'

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, total, shippingAddress } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        totalPrice: total,
        paymentMethod: 'cod',
        shippingAddress,
        status: 'accepted',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            dealProductId: item.isDeal ? (item.dealProductId || item.productId) : null,
            itemName: item.isDeal ? (item.product?.name || null) : null,
            quantity: item.quantity,
            price: item.product?.price || 0,
            size: item.size || null,
            color: item.color || null,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: auth.userId } })

    // Send email confirmation
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true },
    })

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const emailData = {
        orderId: order.id,
        paymentId: 'COD',
        customerName: user?.name || 'Customer',
        customerEmail: user?.email,
        shippingAddress,
        items: order.items.map((i: any) => ({
          name: i.product?.name || i.itemName || 'Deal Product',
          quantity: i.quantity,
          price: i.price,
        })),
        totalPrice: total,
        createdAt: order.createdAt,
      }

      generateInvoicePdf(emailData)
        .then((pdf) => sendOrderEmail(emailData, pdf))
        .catch((err) => console.error('COD order email failed:', err))
    }

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 })
  } catch (error) {
    console.error('COD order creation failed:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
