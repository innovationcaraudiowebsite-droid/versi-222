'use client'

import { TimeRangeSelector } from '@/components/admin/analytics/analytics-view'

/**
 * AnalyticsHeader — client wrapper untuk analytics page header.
 *
 * Server component tidak bisa pass onChange handler ke client component,
 * jadi kita wrap di sini.
 */
interface AnalyticsHeaderProps {
  title: string
  description: string
  range: string
  basePath: string  // e.g., '/admin/analytics' or '/admin/analytics/traffic'
}

export function AnalyticsHeader({ title, description, range, basePath }: AnalyticsHeaderProps) {
  function handleRangeChange(v: string) {
    window.location.href = `${basePath}?range=${v}`
  }

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <TimeRangeSelector value={range} onChange={handleRangeChange} />
    </div>
  )
}
