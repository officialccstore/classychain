import prisma from '@/lib/prisma'

// India has no DST, so IST is always a fixed UTC+5:30 offset.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

// Deal of the Day is gated by a single admin on/off switch, and — when on — runs
// automatically every day from 12:01 AM to 11:59 PM **Indian Standard Time**,
// regardless of what timezone the server process itself happens to run in
// (e.g. hosting platforms typically run servers in UTC).
export async function getDealWindow(): Promise<{ endDate: Date } | null> {
  const cfg = await prisma.siteConfig.findUnique({ where: { key: 'dealOfTheDay' } })
  const enabled = cfg ? !!JSON.parse(cfg.value).enabled : false
  if (!enabled) return null

  const now = new Date()

  // Shift the current instant by the IST offset so its UTC getters read as IST wall-clock time.
  const nowIst = new Date(now.getTime() + IST_OFFSET_MS)
  const startIst = new Date(nowIst)
  startIst.setUTCHours(0, 1, 0, 0)
  const endIst = new Date(nowIst)
  endIst.setUTCHours(23, 59, 0, 0)

  // Shift back to get the real (timezone-agnostic) UTC instants for today's IST window.
  const start = new Date(startIst.getTime() - IST_OFFSET_MS)
  const end = new Date(endIst.getTime() - IST_OFFSET_MS)

  if (now < start || now >= end) return null

  return { endDate: end }
}
