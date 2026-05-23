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

    const { name, description, mrp, price, image, images, categoryId, subcategoryId, brand, sizeVariants, tags, colors, material, features, specifications } = await request.json()

    if (!name || !mrp || !price || !categoryId || !brand) {
      return NextResponse.json(
        { error: 'Name, MRP, price, category, and brand are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        image,
        images: images || [],
        categoryId,
        subcategoryId: subcategoryId || undefined,
        brand,
        tags: tags || [],
        colors: colors || [],
        material: material || undefined,
        features: features || undefined,
        specifications: specifications || undefined,
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
