import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromReq, verifyToken } from '@/lib/auth'

function isAdmin(req: any) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const p = verifyToken(token)
  return p && p.role === 'admin'
}

export async function GET(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [featuredCfg, heroCfg] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'featuredProducts' } }),
    prisma.siteConfig.findUnique({ where: { key: 'heroProducts' } }),
  ])

  const featuredIds: string[] = featuredCfg ? JSON.parse(featuredCfg.value) : []
  const heroIds: string[] = heroCfg ? JSON.parse(heroCfg.value) : []

  return NextResponse.json({ featuredIds, heroIds })
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, productIds } = await request.json()

  if (type !== 'featured' && type !== 'hero') {
    return NextResponse.json({ error: 'type must be "featured" or "hero"' }, { status: 400 })
  }

  const maxItems = type === 'featured' ? 4 : 3
  if (!Array.isArray(productIds) || productIds.length > maxItems) {
    return NextResponse.json({ error: `Max ${maxItems} products allowed` }, { status: 400 })
  }

  const key = type === 'featured' ? 'featuredProducts' : 'heroProducts'

  await prisma.siteConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(productIds) },
    create: { key, value: JSON.stringify(productIds) },
  })

  return NextResponse.json({ ok: true })
}
