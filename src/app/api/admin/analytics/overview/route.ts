import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/overview?range=30d
 *
 * Returns: totalViews, totalVisitors, avgSession, bounceRate,
 *          + comparison vs previous period.
 *
 * Query:
 *  - range: '7d' | '30d' | '90d' | 'all' (default: 30d)
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || '30d'

  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, all: 9999 }
  const days = daysMap[range] || 30

  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const prevStartDate = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000)

  try {
    // Fetch all page views (local JSON fallback handles this)
    const allViews = (await db.pageView.findMany({})) as Array<{
      viewedAt: string | Date
      ipAddress: string | null
      pageType: string
    }>

    // Filter by date range
    const currentViews = allViews.filter((v) => {
      const dt = v.viewedAt instanceof Date ? v.viewedAt : new Date(v.viewedAt)
      return dt >= startDate
    })
    const prevViews = allViews.filter((v) => {
      const dt = v.viewedAt instanceof Date ? v.viewedAt : new Date(v.viewedAt)
      return dt >= prevStartDate && dt < startDate
    })

    const totalViews = currentViews.length
    const totalVisitors = new Set(currentViews.map((v) => v.ipAddress || 'anon')).size
    const prevTotalViews = prevViews.length
    const prevTotalVisitors = new Set(prevViews.map((v) => v.ipAddress || 'anon')).size

    // Calculate bounce rate (single page sessions = views with same IP, only 1 view)
    const viewsByIp = new Map<string, number>()
    for (const v of currentViews) {
      const ip = v.ipAddress || 'anon'
      viewsByIp.set(ip, (viewsByIp.get(ip) || 0) + 1)
    }
    const bounceCount = Array.from(viewsByIp.values()).filter((c) => c === 1).length
    const bounceRate = viewsByIp.size > 0 ? Math.round((bounceCount / viewsByIp.size) * 100) : 0

    // Avg session duration (mock — kalau cuma 1 view, 0; else random 60-180s)
    const avgSession = totalVisitors > 0
      ? Math.round(Array.from(viewsByIp.values()).reduce((a, b) => a + Math.min(b * 75, 300), 0) / viewsByIp.size)
      : 0

    // Calculate change %
    const viewsChange = prevTotalViews > 0
      ? Math.round(((totalViews - prevTotalViews) / prevTotalViews) * 100)
      : (totalViews > 0 ? 100 : 0)
    const visitorsChange = prevTotalVisitors > 0
      ? Math.round(((totalVisitors - prevTotalVisitors) / prevTotalVisitors) * 100)
      : (totalVisitors > 0 ? 100 : 0)

    return NextResponse.json({
      ok: true,
      range,
      totalViews,
      totalVisitors,
      avgSession,
      bounceRate,
      viewsChange,
      visitorsChange,
    })
  } catch (err) {
    console.error('[api/admin/analytics/overview] error:', err)
    return NextResponse.json({
      ok: true,
      range,
      totalViews: 0,
      totalVisitors: 0,
      avgSession: 0,
      bounceRate: 0,
      viewsChange: 0,
      visitorsChange: 0,
      mock: true,
    })
  }
}
