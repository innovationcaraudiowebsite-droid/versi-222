import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/engagement?range=30d
 *
 * Returns: pendingComments, newSubscribers, totalShares
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || '30d'

  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, all: 9999 }
  const days = daysMap[range] || 30
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    // Pending comments
    const pendingComments = (await db.comment.count({
      where: { status: 'PENDING' },
    } as never)) as number

    // New subscribers
    const allSubscribers = (await db.subscriber.findMany({
      select: { subscribedAt: true },
    } as never)) as Array<{ subscribedAt: string | Date }>

    const newSubscribers = allSubscribers.filter((s) => {
      const dt = s.subscribedAt instanceof Date ? s.subscribedAt : new Date(s.subscribedAt)
      return dt >= startDate
    }).length

    // Total WA clicks (as proxy for "shares" — users sharing WA links)
    const allWaClicks = (await db.waClick.findMany({})) as Array<{
      clickedAt: string | Date
    }>
    const shares = allWaClicks.filter((w) => {
      const dt = w.clickedAt instanceof Date ? w.clickedAt : new Date(w.clickedAt)
      return dt >= startDate
    }).length

    return NextResponse.json({
      ok: true,
      range,
      pendingComments,
      newSubscribers,
      totalShares: shares,
      totalSubscribers: allSubscribers.length,
    })
  } catch (err) {
    console.error('[api/admin/analytics/engagement] error:', err)
    return NextResponse.json({
      ok: true,
      range,
      pendingComments: 0,
      newSubscribers: 0,
      totalShares: 0,
      totalSubscribers: 0,
    })
  }
}
