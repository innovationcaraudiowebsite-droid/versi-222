import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/articles?range=30d&limit=10
 *
 * Returns top articles by views.
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || '30d'
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, all: 9999 }
  const days = daysMap[range] || 30
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    const allViews = (await db.pageView.findMany({
      where: { pageType: 'article' },
    } as never)) as Array<{
      pageSlug: string | null
      viewedAt: string | Date
    }>

    const filtered = allViews.filter((v) => {
      const dt = v.viewedAt instanceof Date ? v.viewedAt : new Date(v.viewedAt)
      return dt >= startDate
    })

    // Count per slug
    const counts = new Map<string, number>()
    for (const v of filtered) {
      if (!v.pageSlug) continue
      counts.set(v.pageSlug, (counts.get(v.pageSlug) || 0) + 1)
    }

    // Get articles
    const articles = (await db.article.findMany({
      select: { id: true, slug: true, title: true, publishedAt: true },
      where: { status: 'PUBLISHED' },
    } as never)) as Array<{
      id: string
      slug: string
      title: string
      publishedAt: string | Date | null
    }>

    const result = articles
      .map((a) => ({
        articleId: a.id,
        title: a.title,
        slug: a.slug,
        views: counts.get(a.slug) || 0,
        publishedAt: a.publishedAt,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)

    return NextResponse.json({
      ok: true,
      range,
      articles: result,
    })
  } catch (err) {
    console.error('[api/admin/analytics/articles] error:', err)
    return NextResponse.json({ ok: true, range, articles: [] })
  }
}
