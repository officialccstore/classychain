import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { verifyAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, items, shippingAddress } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    // Snapshot the intended order so the webhook can build it server-side even if
    // the client never comes back to call /verify (app killed, network drop, etc).
    if (Array.isArray(items) && shippingAddress) {
      await prisma.pendingOrder.create({
        data: {
          razorpayOrderId: order.id,
          userId: auth.userId,
          items,
          totalPrice: amount,
          shippingAddress,
        },
      })
    }

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (error) {
    console.error('Failed to create Razorpay order:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
