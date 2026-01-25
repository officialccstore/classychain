import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subfamily = await prisma.subfamily.findUnique({
      where: { id },
      include: {
        categories: {
          where: { isActive: true }
        }
      }
    })

    if (!subfamily) {
      return NextResponse.json({ error: 'Subfamily not found' }, { status: 404 })
    }

    return NextResponse.json(subfamily)
  } catch (error) {
    console.error('Failed to fetch subfamily:', error)
    return NextResponse.json({ error: 'Failed to fetch subfamily' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, family, isActive } = await request.json()

    if (family && !['men', 'women'].includes(family)) {
      return NextResponse.json({ error: 'Family must be either "men" or "women"' }, { status: 400 })
    }

    const subfamily = await prisma.subfamily.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(family && { family }),
        ...(isActive !== undefined && { isActive })
      },
      include: { categories: true }
    })

    return NextResponse.json(subfamily)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subfamily not found' }, { status: 404 })
    }
    console.error('Failed to update subfamily:', error)
    return NextResponse.json({ error: 'Failed to update subfamily' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.subfamily.delete({ where: { id } })
    return NextResponse.json({ message: 'Subfamily deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subfamily not found' }, { status: 404 })
    }
    console.error('Failed to delete subfamily:', error)
    return NextResponse.json({ error: 'Failed to delete subfamily' }, { status: 500 })
  }
}
