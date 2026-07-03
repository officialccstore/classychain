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
  const cfg = await prisma.siteConfig.findUnique({ where: { key: 'shippingRate' } })
  const amount = cfg ? JSON.parse(cfg.value).amount ?? 0 : 0
  return NextResponse.json({ amount })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { amount } = await req.json()
  const parsed = Number(amount)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return NextResponse.json({ error: 'Enter a valid shipping amount' }, { status: 400 })
  }
  await prisma.siteConfig.upsert({
    where: { key: 'shippingRate' },
    update: { value: JSON.stringify({ amount: parsed }) },
    create: { key: 'shippingRate', value: JSON.stringify({ amount: parsed }) },
  })
  return NextResponse.json({ ok: true, amount: parsed })
}
