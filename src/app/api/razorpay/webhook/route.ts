import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import prisma from '@/lib/prisma'
import { sendOrderEmail } from '@/lib/email'
import { generateInvoicePdf } from '@/lib/invoice'
import { decrementStock, InsufficientStockError, StockCheckItem } from '@/lib/stock'

// Server-to-server fallback for order creation. Normally the checkout page calls
// /api/razorpay/verify right after payment succeeds, but that call depends on the
// customer's browser/app surviving long enough to make it (it doesn't if the app
// gets backgrounded/killed, e.g. switching away to take a call mid-checkout). Razorpay
// fires this webhook independently of the client, so it's the only path that reliably
// records an order for every payment that actually gets captured.
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not configured; rejecting webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let validSignature = false
  try {
    validSignature = Razorpay.validateWebhookSignature(rawBody, signature, secret)
  } catch (err) {
    console.error('Webhook signature validation error:', err)
  }
  if (!validSignature) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const body = JSON.parse(rawBody)

  if (body.event !== 'payment.captured') {
    return NextResponse.json({ received: true })
  }

  try {
    const payment = body.payload?.payment?.entity
    const paymentId: string | undefined = payment?.id
    const razorpayOrderId: string | undefined = payment?.order_id

    if (!paymentId || !razorpayOrderId) {
      console.error('payment.captured webhook missing payment id/order id:', body)
      return NextResponse.json({ received: true })
    }

    // Already recorded — either by the client's /verify call, or a duplicate webhook delivery.
    const existingOrder = await prisma.order.findFirst({ where: { paymentId } })
    if (existingOrder) {
      await prisma.pendingOrder.deleteMany({ where: { razorpayOrderId } })
      return NextResponse.json({ received: true, orderId: existingOrder.id })
    }

    const pending = await prisma.pendingOrder.findUnique({ where: { razorpayOrderId } })
    if (!pending) {
      // Nothing to reconstruct the order from. Should not happen in normal operation
      // since /create-order always snapshots one — surface loudly for manual follow-up.
      console.error(`payment.captured for ${paymentId} (order ${razorpayOrderId}) has no PendingOrder snapshot — needs manual reconciliation`)
      return NextResponse.json({ received: true })
    }

    const items = pending.items as any[]
    const stockItems: StockCheckItem[] = items.map((item: any) => ({
      cartItemId: item.id,
      productId: item.productId || null,
      dealProductId: item.dealProductId || (item.isDeal ? item.productId : null),
      sizeVariantId: item.sizeVariantId || null,
      size: item.size || null,
      quantity: item.quantity,
    }))

    const orderData = {
      userId: pending.userId,
      totalPrice: pending.totalPrice,
      paymentId,
      shippingAddress: pending.shippingAddress || '',
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
    }

    let order
    try {
      order = await prisma.$transaction(async (tx: any) => {
        await decrementStock(tx, stockItems)
        return tx.order.create({ data: orderData, include: { items: { include: { product: true } } } })
      })
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        // Payment is already captured — unlike the pre-payment flow we can't bounce
        // the customer back to their cart. Record the order anyway (without decrementing
        // stock) and flag it loudly so an admin can sort out the oversold item manually.
        console.error(`Order for captured payment ${paymentId} oversold one or more items — recording without stock decrement:`, err.issues)
        order = await prisma.order.create({ data: orderData, include: { items: { include: { product: true } } } })
      } else {
        throw err
      }
    }

    await prisma.pendingOrder.deleteMany({ where: { razorpayOrderId } })
    await prisma.cartItem.deleteMany({ where: { userId: pending.userId } })

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const user = await prisma.user.findUnique({ where: { id: pending.userId }, select: { name: true, email: true } })
      const emailData = {
        orderId: order.id,
        paymentId,
        customerName: user?.name || 'Customer',
        customerEmail: user?.email,
        shippingAddress: pending.shippingAddress || '',
        items: order.items.map((i: any) => ({
          name: i.product?.name || i.itemName || 'Deal Product',
          quantity: i.quantity,
          price: i.price,
        })),
        totalPrice: pending.totalPrice,
        createdAt: order.createdAt,
      }
      generateInvoicePdf(emailData)
        .then((pdf) => sendOrderEmail(emailData, pdf))
        .catch((err) => console.error('Order email failed:', err))
    }

    return NextResponse.json({ received: true, orderId: order.id })
  } catch (error) {
    console.error('payment.captured webhook processing failed:', error)
    // Non-2xx makes Razorpay retry the webhook later.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
