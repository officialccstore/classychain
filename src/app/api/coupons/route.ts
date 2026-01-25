import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const homeOnly = searchParams.get('home') === 'true'
    
    const now = new Date()
    const where: any = {}
    
    if (activeOnly) {
      where.isActive = true
      where.validUntil = { gte: now }
      where.validFrom = { lte: now }
    }
    
    if (homeOnly) {
      where.isHome = true
    }
    
    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Failed to fetch coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code, percentage, validUntil, isHome } = await request.json()
    
    if (!code || !percentage || !validUntil) {
      return NextResponse.json(
        { error: 'Code, percentage, and valid until date are required' },
        { status: 400 }
      )
    }
    
    if (percentage < 1 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 1 and 100' },
        { status: 400 }
      )
    }
    
    // If setting this coupon as home, unset all others
    if (isHome) {
      await prisma.coupon.updateMany({
        where: { isHome: true },
        data: { isHome: false }
      })
    }
    
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        percentage: parseInt(percentage),
        validUntil: new Date(validUntil),
        isActive: true,
        isHome: isHome || false
      }
    })
    
    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error('Failed to create coupon:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
