import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/products?range=30d&limit=10
 *
 * Returns top products/variants by views + WA clicks.
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
    // Get all variant page views
    const allViews = (await db.pageView.findMany({
      where: { pageType: 'variant' },
    } as never)) as Array<{
      pageSlug: string | null
      viewedAt: string | Date
    }>

    // Get all WA clicks
    const allWaClicks = (await db.waClick.findMany({})) as Array<{
      variantId: string
      clickedAt: string | Date
    }>

    // Filter by date range
    const filteredViews = allViews.filter((v) => {
      const dt = v.viewedAt instanceof Date ? v.viewedAt : new Date(v.viewedAt)
      return dt >= startDate
    })
    const filteredWa = allWaClicks.filter((v) => {
      const dt = v.clickedAt instanceof Date ? v.clickedAt : new Date(v.clickedAt)
      return dt >= startDate
    })

    // Count views per variant slug
    const viewCounts = new Map<string, number>()
    for (const v of filteredViews) {
      if (!v.pageSlug) continue
      viewCounts.set(v.pageSlug, (viewCounts.get(v.pageSlug) || 0) + 1)
    }

    // Count WA clicks per variant ID
    const waCounts = new Map<string, number>()
    for (const w of filteredWa) {
      waCounts.set(w.variantId, (waCounts.get(w.variantId) || 0) + 1)
    }

    // Get all variants to map slug → id + name + parent
    const variants = (await db.productVariant.findMany({
      select: { id: true, slug: true, name: true, productId: true },
    } as never)) as Array<{
      id: string
      slug: string
      name: string
      productId: string
    }>

    const products = (await db.product.findMany({
      select: { id: true, name: true },
    } as never)) as Array<{ id: string; name: string }>

    const productMap = new Map(products.map((p) => [p.id, p.name]))

    // Build result
    const result = variants
      .map((v) => ({
        variantId: v.id,
        variantName: v.name,
        parentName: productMap.get(v.productId) || 'Unknown',
        slug: v.slug,
        views: viewCounts.get(v.slug) || 0,
        waClicks: waCounts.get(v.id) || 0,
      }))
      .sort((a, b) => b.views - a.views || b.waClicks - a.waClicks)
      .slice(0, limit)

    return NextResponse.json({
      ok: true,
      range,
      products: result,
    })
  } catch (err) {
    console.error('[api/admin/analytics/products] error:', err)
    return NextResponse.json({ ok: true, range, products: [] })
  }
}
