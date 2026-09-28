import { requireAdmin } from '@/lib/auth'
import { ProductsDashboard } from '@/components/admin/analytics/analytics-view'
import { AnalyticsHeader } from '@/components/admin/analytics/analytics-header'

export const dynamic = 'force-dynamic'

export default async function AnalyticsProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  await requireAdmin()
  const { range } = await searchParams
  const rangeVal = range || '30d'

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        title="Analytics — Produk"
        description={`Top variant by views + WhatsApp clicks, periode: ${rangeVal === 'all' ? 'All Time' : `Last ${rangeVal.toUpperCase()}`}`}
        range={rangeVal}
        basePath="/admin/analytics/products"
      />
      <ProductsDashboard range={rangeVal} />
    </div>
  )
}
