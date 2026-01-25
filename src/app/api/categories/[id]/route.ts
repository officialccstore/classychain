import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          where: { isActive: true },
          include: {
            products: {
              include: { sizeVariants: true }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, subfamilyId, isActive } = await request.json()

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subfamilyId && { subfamily: { connect: { id: subfamilyId } } }),
        ...(isActive !== undefined && { isActive })
      },
      include: { subcategories: true, subfamily: true }
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.category.delete({
      where: { id }
    })
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
