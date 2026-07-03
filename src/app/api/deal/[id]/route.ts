import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getDealWindow } from '@/lib/dealSchedule'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const window = await getDealWindow()
    if (!window) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { id } = await params
    const product = await prisma.dealProduct.findUnique({ where: { id } })
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
