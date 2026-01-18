import { NextResponse } from 'next/server'
import { getTokenFromReq, verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

function isAdminFromReq(req: any) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

export async function PUT(request: Request, ctx: any) {
  const { params } = ctx
  try {
    if (!isAdminFromReq(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = params
    const { sizeVariants, ...productData } = body

    // Clean up empty subcategoryId
    const updateData = {
      ...productData,
      subcategoryId: productData.subcategoryId || undefined
    };

    // Update product and handle size variants separately
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        subcategory: true,
        sizeVariants: true
      }
    })

    // If sizeVariants are provided, update them
    if (sizeVariants && Array.isArray(sizeVariants)) {
      // Delete existing size variants
      await prisma.sizeVariant.deleteMany({
        where: { productId: id }
      })

      // Create new size variants
      if (sizeVariants.length > 0) {
        await prisma.sizeVariant.createMany({
          data: sizeVariants.map((sv: any) => ({
            productId: id,
            size: sv.size,
            quantity: sv.quantity
          }))
        })
      }

      // Fetch updated product with new size variants
      const updatedProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          sizeVariants: true
        }
      })

      return NextResponse.json(updatedProduct)
    }

    return NextResponse.json(product)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request, ctx: any) {
  const { params } = ctx
  try {
    if (!isAdminFromReq(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
