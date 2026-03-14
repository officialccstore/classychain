import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Seed defaults if nothing is configured yet
async function seedIfEmpty(key: string, limit: number) {
  const cfg = await prisma.siteConfig.findUnique({ where: { key } })
  if (cfg) return JSON.parse(cfg.value) as string[]

  // Auto-seed with the first `limit` products
  const products = await prisma.product.findMany({ take: limit, orderBy: { createdAt: 'desc' } })
  const ids = products.map(p => p.id)
  await prisma.siteConfig.create({ data: { key, value: JSON.stringify(ids) } })
  return ids
}

export async function GET() {
  try {
    const [featuredIds, heroIds] = await Promise.all([
      seedIfEmpty('featuredProducts', 4),
      seedIfEmpty('heroProducts', 3),
    ])

    const [featuredProducts, heroProducts] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: featuredIds } },
        select: { id: true, name: true, price: true, mrp: true, image: true, brand: true },
      }),
      prisma.product.findMany({
        where: { id: { in: heroIds } },
        select: { id: true, name: true, price: true, image: true, brand: true },
      }),
    ])

    // Preserve the saved order
    const orderedFeatured = featuredIds
      .map(id => featuredProducts.find(p => p.id === id))
      .filter(Boolean)

    const orderedHero = heroIds
      .map(id => heroProducts.find(p => p.id === id))
      .filter(Boolean)

    return NextResponse.json({ featuredProducts: orderedFeatured, heroProducts: orderedHero })
  } catch (error) {
    console.error('homepage config error:', error)
    return NextResponse.json({ featuredProducts: [], heroProducts: [] })
  }
}
