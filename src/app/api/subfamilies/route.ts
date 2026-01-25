import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const family = searchParams.get('family')
    
    const where: any = {}
    if (family) where.family = family
    
    const subfamilies = await prisma.subfamily.findMany({
      where,
      include: {
        categories: true
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(subfamilies)
  } catch (error) {
    console.error('Failed to fetch subfamilies:', error)
    return NextResponse.json({ error: 'Failed to fetch subfamilies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, family } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Subfamily name is required' }, { status: 400 })
    }

    if (!family || !['men', 'women'].includes(family)) {
      return NextResponse.json({ error: 'Family must be either "men" or "women"' }, { status: 400 })
    }

    const subfamily = await prisma.subfamily.create({
      data: { name: name.trim(), family, isActive: true },
      include: { categories: true }
    })

    return NextResponse.json(subfamily, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create subfamily:', error)
    return NextResponse.json({ error: 'Failed to create subfamily' }, { status: 500 })
  }
}
