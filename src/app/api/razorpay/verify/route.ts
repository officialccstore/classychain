import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { sendOrderEmail } from '@/lib/email'
import { generateInvoicePdf } from '@/lib/invoice'
import { decrementStock, InsufficientStockError, StockCheckItem } from '@/lib/stock'

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
      shippingAddress,
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // The payment.captured webhook may have already recorded this order server-side
    // (e.g. if this client call is arriving late after a dropped connection).
    const existingOrder = await prisma.order.findFirst({ where: { paymentId: razorpay_payment_id } })
    if (existingOrder) {
      await prisma.cartItem.deleteMany({ where: { userId: auth.userId } })
      return NextResponse.json({ success: true, orderId: existingOrder.id }, { status: 200 })
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
            totalPrice: total,
            paymentId: razorpay_payment_id,
            shippingAddress: shippingAddress || '',
            status: 'accepted',
            paymentMethod: 'razorpay',
            items: {
              create: items.map((item: any) => ({
                productId: item.productId || null,
                dealProductId: item.dealProductId || item.isDeal ? (item.dealProductId || item.productId) : null,
                itemName: item.product?.name || null,
                itemImage: item.product?.image || null,
                itemBrand: item.product?.brand || null,
                quantity: item.quantity,
                price: item.product?.price || 0,
                size: item.size || null,
                color: item.color || null,
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

    // Clear cart and the pending-order snapshot created before payment
    await prisma.cartItem.deleteMany({ where: { userId: auth.userId } })
    await prisma.pendingOrder.deleteMany({ where: { razorpayOrderId: razorpay_order_id } })

    // Fetch customer details for the email
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true },
    })

    // Fire-and-forget: generate PDF and send email (don't block the response)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const emailData = {
        orderId: order.id,
        paymentId: razorpay_payment_id,
        customerName: user?.name || 'Customer',
        customerEmail: user?.email,
        shippingAddress: shippingAddress || '',
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
        .catch((err) => console.error('Order email failed:', err))
    }

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 })
  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
