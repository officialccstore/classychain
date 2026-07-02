import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { checkStockAvailability, StockCheckItem } from '@/lib/stock'

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await request.json()
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const checkItems: StockCheckItem[] = items.map((item: any) => ({
      cartItemId: item.id,
      productId: item.productId || null,
      dealProductId: item.dealProductId || (item.isDeal ? item.productId : null),
      sizeVariantId: item.sizeVariantId || null,
      size: item.size || null,
      quantity: item.quantity,
    }))

    const issues = await checkStockAvailability(checkItems)

    return NextResponse.json({ valid: issues.length === 0, issues })
  } catch (error) {
    console.error('Stock validation failed:', error)
    return NextResponse.json({ error: 'Failed to validate stock' }, { status: 500 })
  }
}
