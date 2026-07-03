import prisma from '@/lib/prisma'

// Deal of the Day is gated by a single admin on/off switch, and — when on — runs
// automatically every day from 12:01 AM to 11:59 PM. No manual date range needed,
// so there's nothing for an admin to forget to update or get a timezone-shifted display of.
export async function getDealWindow(): Promise<{ endDate: Date } | null> {
  const cfg = await prisma.siteConfig.findUnique({ where: { key: 'dealOfTheDay' } })
  const enabled = cfg ? !!JSON.parse(cfg.value).enabled : false
  if (!enabled) return null

  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 1, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 0, 0)

  if (now < start || now >= end) return null

  return { endDate: end }
}
