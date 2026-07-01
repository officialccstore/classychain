import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const cfg = await prisma.siteConfig.findUnique({ where: { key: 'dealOfTheDay' } })
    if (!cfg) return NextResponse.json({ deal: null })

    const deal = JSON.parse(cfg.value)
    const now = new Date()
    const start = new Date(deal.startDate)
    const end = new Date(deal.endDate)

    if (now < start || now > end) return NextResponse.json({ deal: null })

    const products = await prisma.dealProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (products.length === 0) return NextResponse.json({ deal: null })

    return NextResponse.json({ deal: { startDate: deal.startDate, endDate: deal.endDate, products } })
  } catch {
    return NextResponse.json({ deal: null })
  }
}
