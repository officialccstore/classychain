import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromReq, verifyToken } from '@/lib/auth'

function isAdminFromReq(req: any) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

export async function POST(request: Request) {
  try {
    // Basic admin check
    if (!isAdminFromReq(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, price, image, categoryId, subcategoryId, brand, sizeVariants } = await request.json()

    if (!name || !price || !categoryId || !brand) {
      return NextResponse.json(
        { error: 'Name, price, category, and brand are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        categoryId,
        subcategoryId: subcategoryId || undefined, // Convert empty string to undefined
        brand,
        sizeVariants: sizeVariants && sizeVariants.length > 0 ? {
          create: sizeVariants
        } : undefined
      },
      include: {
        category: true,
        subcategory: true,
        sizeVariants: true
      }
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    if (!isAdminFromReq(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
        sizeVariants: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
