import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/traffic?range=30d
 *
 * Returns: daily array of { date, views, visitors }
 * For line chart "Views vs Visitors".
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || '30d'

  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, all: 30 }
  const days = daysMap[range] || 30

  try {
    const allViews = (await db.pageView.findMany({})) as Array<{
      viewedAt: string | Date
      ipAddress: string | null
    }>

    // Build daily buckets
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const dailyData: Array<{ date: string; views: number; visitors: Set<string> }> = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      dailyData.push({ date: dateStr, views: 0, visitors: new Set() })
    }

    for (const v of allViews) {
      const dt = v.viewedAt instanceof Date ? v.viewedAt : new Date(v.viewedAt)
      if (dt < startDate) continue
      const dateStr = dt.toISOString().split('T')[0]
      const bucket = dailyData.find((d) => d.date === dateStr)
      if (bucket) {
        bucket.views++
        bucket.visitors.add(v.ipAddress || 'anon')
      }
    }

    return NextResponse.json({
      ok: true,
      range,
      daily: dailyData.map((d) => ({
        date: d.date,
        views: d.views,
        visitors: d.visitors.size,
      })),
    })
  } catch (err) {
    console.error('[api/admin/analytics/traffic] error:', err)
    return NextResponse.json({ ok: true, range, daily: [] })
  }
}
