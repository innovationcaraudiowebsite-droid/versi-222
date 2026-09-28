'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, Users, Clock, AlertCircle,
  Eye, FileText, MessageSquare, Share2,
  Loader2,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend,
} from 'recharts'

interface OverviewData {
  ok: boolean
  range: string
  totalViews: number
  totalVisitors: number
  avgSession: number
  bounceRate: number
  viewsChange: number
  visitorsChange: number
  mock?: boolean
}
interface TrafficData {
  ok: boolean
  range: string
  daily: Array<{ date: string; views: number; visitors: number }>
}
interface ProductAnalytics {
  ok: boolean
  range: string
  products: Array<{
    variantId: string
    variantName: string
    parentName: string
    slug: string
    views: number
    waClicks: number
  }>
}
interface ArticleAnalytics {
  ok: boolean
  range: string
  articles: Array<{
    articleId: string
    title: string
    slug: string
    views: number
  }>
}
interface EngagementData {
  ok: boolean
  range: string
  pendingComments: number
  newSubscribers: number
  totalShares: number
  totalSubscribers: number
}

const RANGES = [
  { value: '7d', label: '7 hari' },
  { value: '30d', label: '30 hari' },
  { value: '90d', label: '90 hari' },
  { value: 'all', label: 'Semua' },
]

export function TimeRangeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            value === r.value
              ? 'bg-red-600 text-white'
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

function StatCard({
  label, value, change, icon: Icon, invertChange,
}: {
  label: string
  value: string | number
  change?: number
  icon: typeof Eye
  invertChange?: boolean
}) {
  const isPositive = change !== undefined ? (invertChange ? change < 0 : change > 0) : false
  const isNeutral = change === 0 || change === undefined
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold truncate">{label}</div>
          <div className="mt-1 text-2xl font-bold text-foreground truncate">{value}</div>
          {change !== undefined && (
            <div className={`mt-0.5 text-xs flex items-center gap-1 ${
              isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {!isNeutral && (isPositive ? '↑' : '↓')} {Math.abs(change)}% vs periode lalu
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-md p-2 bg-red-500/10 text-red-600 dark:text-red-400">
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-border bg-card p-12 grid place-items-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">Memuat data analytics...</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <AlertCircle className="size-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function OverviewDashboard({ range }: { range: string }) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [traffic, setTraffic] = useState<TrafficData | null>(null)
  const [engagement, setEngagement] = useState<EngagementData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        const [ov, tr, en] = await Promise.all([
          fetch(`/api/admin/analytics/overview?range=${range}`).then((r) => r.json()),
          fetch(`/api/admin/analytics/traffic?range=${range}`).then((r) => r.json()),
          fetch(`/api/admin/analytics/engagement?range=${range}`).then((r) => r.json()),
        ])
        if (!cancelled) {
          setData(ov)
          setTraffic(tr)
          setEngagement(en)
        }
      } catch (err) {
        console.error('[overview] fetch error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [range])

  if (loading) return <LoadingState />

  const fmtDuration = (sec: number) => {
    if (!sec) return '0s'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }
  const fmtNum = (n: number) => n.toLocaleString('id-ID')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Views" value={fmtNum(data?.totalViews || 0)} change={data?.viewsChange} icon={Eye} />
        <StatCard label="Total Visitor" value={fmtNum(data?.totalVisitors || 0)} change={data?.visitorsChange} icon={Users} />
        <StatCard label="Avg Session" value={fmtDuration(data?.avgSession || 0)} icon={Clock} />
        <StatCard label="Bounce Rate" value={`${data?.bounceRate || 0}%`} change={0} icon={TrendingUp} invertChange />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-red-500" />
            <h2 className="text-lg font-bold tracking-tight">Traffic Last {range === 'all' ? 'All Time' : range.toUpperCase()}</h2>
          </div>
          {traffic?.daily && traffic.daily.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={traffic.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="views" name="Views" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Belum ada data traffic untuk periode ini." />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-4 text-red-500" />
            <h2 className="text-lg font-bold tracking-tight">Engagement</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <span className="text-sm">Comments Pending</span>
              </div>
              <span className="font-bold text-rose-600">{engagement?.pendingComments || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm">New Subscribers</span>
              </div>
              <span className="font-bold text-emerald-600">+{engagement?.newSubscribers || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 className="size-4 text-muted-foreground" />
                <span className="text-sm">WhatsApp Clicks</span>
              </div>
              <span className="font-bold">{engagement?.totalShares || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm">Total Subscribers</span>
              </div>
              <span className="font-bold">{engagement?.totalSubscribers || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {data?.mock && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3 text-xs text-amber-700 dark:text-amber-300">
          ⚠️ <strong>Mock mode:</strong> Data tracking dari local JSON. Real tracking aktif setelah Supabase connect.
        </div>
      )}
    </div>
  )
}

export function TrafficDashboard({ range }: { range: string }) {
  const [data, setData] = useState<TrafficData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    async function fetchTraffic() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics/traffic?range=${range}`)
        const d = await res.json()
        if (!cancelled) setData(d)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTraffic()
    return () => { cancelled = true }
  }, [range])
  if (loading) return <LoadingState />
  if (!data || data.daily.length === 0) return <EmptyState message="Belum ada data traffic." />
  const totalViews = data.daily.reduce((sum, d) => sum + d.views, 0)
  const totalVisitors = data.daily.reduce((sum, d) => sum + d.visitors, 0)
  const peakDay = data.daily.reduce((max, d) => (d.views > max.views ? d : max), data.daily[0])
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Views" value={totalViews.toLocaleString('id-ID')} icon={Eye} />
        <StatCard label="Total Visitors" value={totalVisitors.toLocaleString('id-ID')} icon={Users} />
        <StatCard label="Peak Day Views" value={peakDay.views} icon={TrendingUp} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-bold tracking-tight mb-4">Daily Traffic</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(d: string) => d.slice(5)} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="views" name="Views" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ProductsDashboard({ range }: { range: string }) {
  const [data, setData] = useState<ProductAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    async function fetchProducts() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics/products?range=${range}&limit=20`)
        const d = await res.json()
        if (!cancelled) setData(d)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [range])
  if (loading) return <LoadingState />
  if (!data || data.products.length === 0) return <EmptyState message="Belum ada data klik produk." />
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Produk / Varian</th>
              <th className="px-4 py-3 text-center font-semibold">Views</th>
              <th className="px-4 py-3 text-center font-semibold">WA Clicks</th>
              <th className="px-4 py-3 text-right font-semibold">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p, idx) => (
              <tr key={p.variantId} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{p.parentName}</div>
                  <div className="text-xs text-muted-foreground">{p.variantName} · /produk/{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-center font-semibold">{p.views}</td>
                <td className="px-4 py-3 text-center font-semibold text-emerald-600">{p.waClicks}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {p.views > 0 ? `${((p.waClicks / p.views) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-bold tracking-tight mb-4">Top 10 by Views</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.products.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis type="category" dataKey="variantName" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="views" name="Views" fill="#dc2626" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ArticlesDashboard({ range }: { range: string }) {
  const [data, setData] = useState<ArticleAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    async function fetchArticles() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics/articles?range=${range}&limit=20`)
        const d = await res.json()
        if (!cancelled) setData(d)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchArticles()
    return () => { cancelled = true }
  }, [range])
  if (loading) return <LoadingState />
  if (!data || data.articles.length === 0) return <EmptyState message="Belum ada data views artikel." />
  const totalViews = data.articles.reduce((sum, a) => sum + a.views, 0)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Article Views" value={totalViews.toLocaleString('id-ID')} icon={FileText} />
        <StatCard label="Articles Tracked" value={data.articles.length} icon={Eye} />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Judul Artikel</th>
              <th className="px-4 py-3 text-center font-semibold">Views</th>
              <th className="px-4 py-3 text-right font-semibold">% dari Total</th>
            </tr>
          </thead>
          <tbody>
            {data.articles.map((a, idx) => (
              <tr key={a.articleId} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground line-clamp-1">{a.title}</div>
                  <div className="text-xs text-muted-foreground">/berita/{a.slug}</div>
                </td>
                <td className="px-4 py-3 text-center font-semibold">{a.views}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {totalViews > 0 ? `${((a.views / totalViews) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function EngagementDashboard({ range }: { range: string }) {
  const [data, setData] = useState<EngagementData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    async function fetchEngagement() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics/engagement?range=${range}`)
        const d = await res.json()
        if (!cancelled) setData(d)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchEngagement()
    return () => { cancelled = true }
  }, [range])
  if (loading) return <LoadingState />
  if (!data) return <EmptyState message="Gagal memuat data engagement." />
  const deviceData = [
    { name: 'Mobile', value: 62, color: '#dc2626' },
    { name: 'Desktop', value: 31, color: '#3b82f6' },
    { name: 'Tablet', value: 7, color: '#10b981' },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Comments Pending" value={data.pendingComments} icon={MessageSquare} />
        <StatCard label="New Subscribers" value={`+${data.newSubscribers}`} icon={Users} />
        <StatCard label="WA Clicks" value={data.totalShares} icon={Share2} />
        <StatCard label="Total Subscribers" value={data.totalSubscribers} icon={Users} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-bold tracking-tight mb-4">Device Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry: { name: string; value: number }) => `${entry.name}: ${entry.value}%`} labelLine={false}>
                {deviceData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-bold tracking-tight mb-4">Engagement Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-rose-100 dark:bg-rose-950 p-2">
                  <MessageSquare className="size-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Comments Pending</div>
                  <div className="text-xs text-muted-foreground">Perlu moderasi</div>
                </div>
              </div>
              <span className="text-xl font-bold">{data.pendingComments}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-950 p-2">
                  <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">New Subscribers</div>
                  <div className="text-xs text-muted-foreground">Periode {range}</div>
                </div>
              </div>
              <span className="text-xl font-bold text-emerald-600">+{data.newSubscribers}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-blue-100 dark:bg-blue-950 p-2">
                  <Share2 className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">WhatsApp Clicks</div>
                  <div className="text-xs text-muted-foreground">Tombol "Tanya WA"</div>
                </div>
              </div>
              <span className="text-xl font-bold">{data.totalShares}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-amber-100 dark:bg-amber-950 p-2">
                  <Users className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Total Subscribers</div>
                  <div className="text-xs text-muted-foreground">All time</div>
                </div>
              </div>
              <span className="text-xl font-bold">{data.totalSubscribers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
