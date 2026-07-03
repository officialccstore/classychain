import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getTokenFromReq, verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

function isAdminFromReq(req: any) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

export async function GET(request: Request) {
  try {
    if (!isAdminFromReq(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: { include: { category: true, subcategory: true } } } },
        user: { select: { name: true, email: true, phone: true, address: true, city: true, state: true, zipCode: true, country: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
