import { NextResponse, NextRequest } from 'next/server'
import { getTokenFromReq, verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

function isAdmin(req: NextRequest) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { name, description, category, sizeVariants, image, isActive, price, images } = await req.json()
  const updated = await prisma.dealProduct.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(category !== undefined && { category }),
      ...(sizeVariants !== undefined && { sizeVariants }),
      ...(image !== undefined && { image }),
      ...(isActive !== undefined && { isActive }),
      ...(price !== undefined && { price: Number(price) }),
      ...(images !== undefined && { images: Array.isArray(images) ? images.filter(Boolean) : [] }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.dealProduct.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
