import prisma from '@/lib/prisma'

export interface StockCheckItem {
  cartItemId?: string | null
  productId?: string | null
  dealProductId?: string | null
  sizeVariantId?: string | null
  size?: string | null
  quantity: number
}

export interface StockIssue {
  cartItemId?: string | null
  productId?: string | null
  dealProductId?: string | null
  size?: string | null
  name?: string
  available: number
  requested: number
}

export class InsufficientStockError extends Error {
  issues: StockIssue[]
  constructor(issues: StockIssue[]) {
    super('Insufficient stock for one or more items')
    this.issues = issues
  }
}

function resolveDealId(item: StockCheckItem): string | null {
  return item.dealProductId || null
}

// Read-only check, used before payment is initiated so the customer can be
// bounced back to the cart instead of being charged for something unavailable.
export async function checkStockAvailability(items: StockCheckItem[]): Promise<StockIssue[]> {
  const issues: StockIssue[] = []

  for (const item of items) {
    const dealId = resolveDealId(item)
    if (dealId) {
      const dp = await prisma.dealProduct.findUnique({ where: { id: dealId } })
      const svs = (dp?.sizeVariants || []) as Array<{ size: string; quantity: number }>
      const sv = svs.find((s) => s.size === item.size)
      const available = sv?.quantity ?? 0
      if (available < item.quantity) {
        issues.push({ cartItemId: item.cartItemId, dealProductId: dealId, size: item.size, name: dp?.name, available, requested: item.quantity })
      }
    } else if (item.sizeVariantId) {
      const sv = await prisma.sizeVariant.findUnique({
        where: { id: item.sizeVariantId },
        include: { product: { select: { name: true } } },
      })
      const available = sv?.quantity ?? 0
      if (available < item.quantity) {
        issues.push({ cartItemId: item.cartItemId, productId: item.productId, size: item.size, name: sv?.product?.name, available, requested: item.quantity })
      }
    }
  }

  return issues
}

// Atomically re-checks and decrements stock. Must be called with a Prisma
// transaction client so the decrement and the order creation succeed or fail together.
export async function decrementStock(tx: any, items: StockCheckItem[]): Promise<void> {
  const issues: StockIssue[] = []

  for (const item of items) {
    const dealId = resolveDealId(item)
    if (dealId) {
      const dp = await tx.dealProduct.findUnique({ where: { id: dealId } })
      const svs = (dp?.sizeVariants || []) as Array<{ size: string; quantity: number }>
      const idx = svs.findIndex((s) => s.size === item.size)
      const available = idx >= 0 ? svs[idx].quantity : 0
      if (idx === -1 || available < item.quantity) {
        issues.push({ cartItemId: item.cartItemId, dealProductId: dealId, size: item.size, name: dp?.name, available, requested: item.quantity })
        continue
      }
      const updated = [...svs]
      updated[idx] = { ...updated[idx], quantity: available - item.quantity }
      await tx.dealProduct.update({ where: { id: dealId }, data: { sizeVariants: updated } })
    } else if (item.sizeVariantId) {
      const result = await tx.sizeVariant.updateMany({
        where: { id: item.sizeVariantId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      })
      if (result.count === 0) {
        const sv = await tx.sizeVariant.findUnique({ where: { id: item.sizeVariantId }, include: { product: { select: { name: true } } } })
        issues.push({ cartItemId: item.cartItemId, productId: item.productId, size: item.size, name: sv?.product?.name, available: sv?.quantity ?? 0, requested: item.quantity })
      }
    }
  }

  if (issues.length > 0) {
    throw new InsufficientStockError(issues)
  }
}
