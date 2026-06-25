import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromReq, verifyToken } from '@/lib/auth'

function isAdminFromReq(req: any) {
  const token = getTokenFromReq(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(request: Request) {
  try {
    if (!isAdminFromReq(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all orders with items info
    // Note: user is fetched separately (not via `include`) because the user
    // relation is required in the schema, but Mongo doesn't enforce FK
    // integrity — orders can reference a userId whose User document was
    // deleted, which would make a required `include` throw instead of
    // returning null.
    const allOrders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const userIds = Array.from(new Set(allOrders.map((o: { userId: string }) => o.userId)))
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    })
    const userNameById = new Map(users.map((u: { id: string; name: string }) => [u.id, u.name]))

    const totalUsers = await prisma.user.count({ where: { role: 'user' } })
    const totalProducts = await prisma.product.count()

    // ── Overall stats ────────────────────────────────────────────────────────
    const totalOrders = allOrders.length
    const totalRevenue = allOrders.reduce((s: number, o: { totalPrice: number }) => s + o.totalPrice, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const uniqueCustomers = new Set(allOrders.map((o: { userId: string }) => o.userId)).size

    // ── Order status distribution ────────────────────────────────────────────
    const statusCount: Record<string, number> = {}
    for (const o of allOrders) {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1
    }
    const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      status: status.toUpperCase(),
      count,
    }))

    // ── Daily sales – last 30 days ───────────────────────────────────────────
    const dailyMap: Record<string, { revenue: number; orders: number }> = {}
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      dailyMap[formatDate(d)] = { revenue: 0, orders: 0 }
    }
    for (const o of allOrders) {
      const key = formatDate(new Date(o.createdAt))
      if (dailyMap[key]) {
        dailyMap[key].revenue += o.totalPrice
        dailyMap[key].orders += 1
      }
    }
    const dailySales = Object.entries(dailyMap).map(([date, v]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: Math.round(v.revenue),
      orders: v.orders,
    }))

    // ── Monthly sales – last 12 months ───────────────────────────────────────
    const monthlyMap: Record<string, { revenue: number; orders: number }> = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      monthlyMap[formatMonth(d)] = { revenue: 0, orders: 0 }
    }
    for (const o of allOrders) {
      const key = formatMonth(new Date(o.createdAt))
      if (monthlyMap[key]) {
        monthlyMap[key].revenue += o.totalPrice
        monthlyMap[key].orders += 1
      }
    }
    const monthlySales = Object.entries(monthlyMap).map(([month, v]) => {
      const [yr, mo] = month.split('-')
      return {
        month,
        label: new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: Math.round(v.revenue),
        orders: v.orders,
      }
    })

    // ── Top 5 products by revenue ────────────────────────────────────────────
    const productRevMap: Record<string, { name: string; revenue: number; unitsSold: number }> = {}
    for (const o of allOrders) {
      for (const item of o.items) {
        const pid = item.productId
        if (!productRevMap[pid]) {
          productRevMap[pid] = { name: item.product?.name || 'Unknown', revenue: 0, unitsSold: 0 }
        }
        productRevMap[pid].revenue += item.price * item.quantity
        productRevMap[pid].unitsSold += item.quantity
      }
    }
    const topProducts = Object.values(productRevMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({ ...p, revenue: Math.round(p.revenue) }))

    // ── Recent 5 orders ──────────────────────────────────────────────────────
    const recentOrders = allOrders
      .slice(-5)
      .reverse()
      .map((o: any) => ({
        id: o.id,
        totalPrice: o.totalPrice,
        status: o.status,
        itemCount: o.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
        createdAt: o.createdAt,
        customerName: userNameById.get(o.userId) || 'Guest',
      }))

    return NextResponse.json({
      overview: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue),
        uniqueCustomers,
        totalUsers,
        totalProducts,
      },
      statusDistribution,
      dailySales,
      monthlySales,
      topProducts,
      recentOrders,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
