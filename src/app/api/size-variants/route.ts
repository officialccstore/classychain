import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { productId, size, quantity } = await request.json()

    if (!productId || !size || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID, size, and quantity are required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const sizeVariant = await prisma.sizeVariant.create({
      data: {
        productId,
        size,
        quantity
      }
    })

    return NextResponse.json(sizeVariant, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Size variant already exists for this product' },
        { status: 409 }
      )
    }
    console.error('Failed to create size variant:', error)
    return NextResponse.json({ error: 'Failed to create size variant' }, { status: 500 })
  }
}
