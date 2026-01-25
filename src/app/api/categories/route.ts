import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true }
        },
        subfamily: true
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, subfamilyId } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    if (!subfamilyId) {
      return NextResponse.json({ error: 'Subfamily is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { 
        name: name.trim(), 
        subfamily: { connect: { id: subfamilyId } },
        isActive: true 
      },
      include: { subcategories: true, subfamily: true }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
