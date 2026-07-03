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
  const enabled = cfg ? !!JSON.parse(cfg.value).enabled : false
  return NextResponse.json({ enabled })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { enabled } = await req.json()
  await prisma.siteConfig.upsert({
    where: { key: 'dealOfTheDay' },
    update: { value: JSON.stringify({ enabled: !!enabled }) },
    create: { key: 'dealOfTheDay', value: JSON.stringify({ enabled: !!enabled }) },
  })
  return NextResponse.json({ ok: true, enabled: !!enabled })
}
