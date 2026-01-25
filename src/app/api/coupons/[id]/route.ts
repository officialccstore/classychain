import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    })
    
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    
    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Failed to fetch coupon:', error)
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { code, percentage, validUntil, isActive, isHome } = await request.json()
    
    const updateData: any = {}
    if (code !== undefined) updateData.code = code.toUpperCase()
    if (percentage !== undefined) {
      if (percentage < 1 || percentage > 100) {
        return NextResponse.json(
          { error: 'Percentage must be between 1 and 100' },
          { status: 400 }
        )
      }
      updateData.percentage = parseInt(percentage)
    }
    if (validUntil !== undefined) updateData.validUntil = new Date(validUntil)
    if (isActive !== undefined) updateData.isActive = isActive
    if (isHome !== undefined) {
      updateData.isHome = isHome
      // If setting this coupon as home, unset all others
      if (isHome) {
        await prisma.coupon.updateMany({
          where: { 
            isHome: true,
            NOT: { id: params.id }
          },
          data: { isHome: false }
        })
      }
    }
    
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error('Failed to update coupon:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.coupon.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Coupon deleted successfully' })
  } catch (error: any) {
    console.error('Failed to delete coupon:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
