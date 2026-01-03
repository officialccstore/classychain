import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { quantity } = await request.json()

    if (quantity === undefined) {
      return NextResponse.json(
        { error: 'Quantity is required' },
        { status: 400 }
      )
    }

    const sizeVariant = await prisma.sizeVariant.update({
      where: { id },
      data: { quantity }
    })

    return NextResponse.json(sizeVariant)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Size variant not found' }, { status: 404 })
    }
    console.error('Failed to update size variant:', error)
    return NextResponse.json({ error: 'Failed to update size variant' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.sizeVariant.delete({
      where: { id }
    })
    return NextResponse.json({ message: 'Size variant deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Size variant not found' }, { status: 404 })
    }
    console.error('Failed to delete size variant:', error)
    return NextResponse.json({ error: 'Failed to delete size variant' }, { status: 500 })
  }
}
