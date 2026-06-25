import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

const SEED_REELS = [
  { id: '1', url: 'https://www.instagram.com/reel/DQ4HFBMkgY7/', title: 'Dwarka Ramphal Chowk walk-through', page: 'both' },
  { id: '2', url: 'https://www.instagram.com/reel/DRBifF4EpAX/', title: 'Sneaker wall highlight', page: 'both' },
  { id: '3', url: 'https://www.instagram.com/reel/DRL2O5_kkVp/', title: 'Store drop teaser', page: 'both' },
]

export async function GET(req: NextRequest) {
  try {
    const page = new URL(req.url).searchParams.get('page') // 'home' | 'about'
    let cfg = await prisma.siteConfig.findUnique({ where: { key: 'reels' } })
    if (!cfg) {
      await prisma.siteConfig.create({ data: { key: 'reels', value: JSON.stringify(SEED_REELS) } })
      cfg = { key: 'reels', value: JSON.stringify(SEED_REELS), id: '' }
    }
    const all: any[] = JSON.parse(cfg.value)
    const filtered = page ? all.filter(r => r.page === page || r.page === 'both') : all
    return NextResponse.json({ reels: filtered })
  } catch {
    return NextResponse.json({ reels: [] })
  }
}
