import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getDealWindow } from '@/lib/dealSchedule'

export async function GET() {
  try {
    const window = await getDealWindow()
    if (!window) return NextResponse.json({ deal: null })

    const products = await prisma.dealProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (products.length === 0) return NextResponse.json({ deal: null })

    return NextResponse.json({ deal: { endDate: window.endDate.toISOString(), products } })
  } catch {
    return NextResponse.json({ deal: null })
  }
}
