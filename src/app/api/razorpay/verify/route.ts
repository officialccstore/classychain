import { NextResponse } from 'next/server'
import crypto from 'crypto'
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

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        totalPrice: total,
        paymentId: razorpay_payment_id,
        shippingAddress: shippingAddress || '',
        status: 'accepted',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product?.price || 0,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: auth.userId } })

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
          name: i.product.name,
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
