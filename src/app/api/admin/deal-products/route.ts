import { NextResponse, NextRequest } from 'next/server'
import { getTokenFromReq, verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

function isAdmin(req: NextRequest) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await prisma.dealProduct.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, description, category, sizeVariants, image, price, images } = await req.json()
  if (!name?.trim() || !image || !Array.isArray(sizeVariants) || sizeVariants.length === 0) {
    return NextResponse.json({ error: 'Name, image, and at least one size are required' }, { status: 400 })
  }
  const product = await prisma.dealProduct.create({
    data: {
      name: name.trim(),
      description: description?.trim() || '',
      category,
      sizeVariants,
      image,
      price: Number(price) || 0,
      images: Array.isArray(images) ? images.filter(Boolean) : [],
    },
  })
  return NextResponse.json(product, { status: 201 })
}
