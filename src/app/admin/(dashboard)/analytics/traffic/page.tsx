import { requireAdmin } from '@/lib/auth'
import { TrafficDashboard } from '@/components/admin/analytics/analytics-view'
import { AnalyticsHeader } from '@/components/admin/analytics/analytics-header'

export const dynamic = 'force-dynamic'

export default async function AnalyticsTrafficPage({
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
        title="Analytics — Traffic"
        description={`Detail traffic views vs visitors per periode: ${rangeVal === 'all' ? 'All Time' : `Last ${rangeVal.toUpperCase()}`}`}
        range={rangeVal}
        basePath="/admin/analytics/traffic"
      />
      <TrafficDashboard range={rangeVal} />
    </div>
  )
}
