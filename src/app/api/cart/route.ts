import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const cartItems = await prisma.cartItem.findMany({
      include: { product: true },
    })
    return NextResponse.json(cartItems)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()

    const existingItem = await prisma.cartItem.findUnique({
      where: { productId },
    })

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { productId },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      })
      return NextResponse.json(updated)
    }

    const cartItem = await prisma.cartItem.create({
      data: { productId, quantity },
      include: { product: true },
    })
    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
