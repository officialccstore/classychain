import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, isActive } = await request.json()

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(subcategory)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }
    console.error('Failed to update subcategory:', error)
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.subcategory.delete({
      where: { id }
    })
    return NextResponse.json({ message: 'Subcategory deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }
    console.error('Failed to delete subcategory:', error)
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 })
  }
}
