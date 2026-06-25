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
  const cfg = await prisma.siteConfig.findUnique({ where: { key: 'dealOfTheDay' } })
  return NextResponse.json({ deal: cfg ? JSON.parse(cfg.value) : null })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { deal } = await req.json()
  if (deal === null) {
    await prisma.siteConfig.deleteMany({ where: { key: 'dealOfTheDay' } })
    return NextResponse.json({ ok: true })
  }
  await prisma.siteConfig.upsert({
    where: { key: 'dealOfTheDay' },
    update: { value: JSON.stringify(deal) },
    create: { key: 'dealOfTheDay', value: JSON.stringify(deal) },
  })
  return NextResponse.json({ ok: true })
}
