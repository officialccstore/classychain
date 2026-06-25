import { NextResponse, NextRequest } from 'next/server'
import { getTokenFromReq, verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

function isAdmin(req: NextRequest) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

const SEED_REELS = [
  { id: '1', url: 'https://www.instagram.com/reel/DQ4HFBMkgY7/', title: 'Dwarka Ramphal Chowk walk-through', page: 'both' },
  { id: '2', url: 'https://www.instagram.com/reel/DRBifF4EpAX/', title: 'Sneaker wall highlight', page: 'both' },
  { id: '3', url: 'https://www.instagram.com/reel/DRL2O5_kkVp/', title: 'Store drop teaser', page: 'both' },
]

async function getOrSeedReels() {
  const cfg = await prisma.siteConfig.findUnique({ where: { key: 'reels' } })
  if (cfg) return JSON.parse(cfg.value)
  await prisma.siteConfig.create({ data: { key: 'reels', value: JSON.stringify(SEED_REELS) } })
  return SEED_REELS
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const reels = await getOrSeedReels()
  return NextResponse.json({ reels })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { reels } = await req.json()
  await prisma.siteConfig.upsert({
    where: { key: 'reels' },
    update: { value: JSON.stringify(reels) },
    create: { key: 'reels', value: JSON.stringify(reels) },
  })
  return NextResponse.json({ ok: true })
}
