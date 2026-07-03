import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const cfg = await prisma.siteConfig.findUnique({ where: { key: 'shippingRate' } })
    const amount = cfg ? JSON.parse(cfg.value).amount ?? 0 : 0
    return NextResponse.json({ amount })
  } catch {
    return NextResponse.json({ amount: 0 })
  }
}
