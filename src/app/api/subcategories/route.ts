import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { categoryId, name } = await request.json()

    if (!categoryId || !name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category ID and subcategory name are required' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId,
        name: name.trim(),
        isActive: true
      }
    })

    return NextResponse.json(subcategory, { status: 201 })
  } catch (error) {
    console.error('Failed to create subcategory:', error)
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 })
  }
}
