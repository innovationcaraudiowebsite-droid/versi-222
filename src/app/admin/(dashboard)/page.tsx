import Link from 'next/link'
import {
  ArrowUpRight,
  Eye,
  FileText,
  HelpCircle,
  Mail,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Archive,
  MessageSquare,
  Package,
  Layers,
  TrendingUp,
  Users,
} from 'lucide-react'

import { db } from '@/lib/db'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  CategoryViewsPie,
  MonthlyArticlesChart,
  TierDonutChart,
  type CategorySlice,
  type MonthlyPoint,
} from './charts'

export const metadata = {
  title: 'Overview — Admin Peredam Mobil Jakarta',
  description: 'Ringkasan statistik & aktivitas portal.',
  robots: { index: false, follow: false },
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const ID_DATE = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const ID_DATE_SHORT = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
})

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return ID_DATE.format(d)
}

function fmtRelative(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return 'Hari ini'
  if (diff < 2 * day) return 'Kemarin'
  if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`
  return ID_DATE_SHORT.format(d)
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PUBLISHED':
      return 'default'
    case 'DRAFT':
      return 'secondary'
    case 'ARCHIVED':
      return 'outline'
    default:
      return 'outline'
  }
}

/* -------------------------------------------------------------------------- */
/*  Stat cards (server-rendered)                                              */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string // tailwind gradient classes
  iconColor: string
  href?: string
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  gradient,
  iconColor,
  href,
}: StatCardProps) {
  const inner = (
    <>
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm',
          gradient,
        )}
        aria-hidden
      >
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-2xl font-bold leading-tight text-foreground tabular-nums">
          {value}
        </span>
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {href && (
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted-foreground/60"
          aria-hidden
        />
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        {inner}
      </Link>
    )
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
      {inner}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Quick actions                                                             */
/* -------------------------------------------------------------------------- */

function QuickActions() {
  return (
    <Card className="border-dashed bg-gradient-to-br from-red-50 via-orange-50 to-background dark:from-red-950/20 dark:via-orange-950/20">
      <CardHeader>
        <CardTitle className="text-base">Aksi Cepat</CardTitle>
        <CardDescription>Mulai tugas harian dengan satu klik.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild className="bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800">
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4" />
            Artikel Baru
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/products/new">
            <Package className="h-4 w-4" />
            Produk Baru
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/variants/new">
            <Layers className="h-4 w-4" />
            Varian Baru
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/faq">
            <HelpCircle className="h-4 w-4" />
            Kelola FAQ
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/comments">
            <MessageSquare className="h-4 w-4" />
            Moderasi Komentar
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tables                                                                     */
/* -------------------------------------------------------------------------- */

interface ArticleRow {
  id: string
  title: string
  status: string
  categoryName: string
  createdAt: string
  viewCount: number
  publishedAt: string | null
}

function RecentArticlesTable({ rows }: { rows: ArticleRow[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">Artikel Terbaru</CardTitle>
          <CardDescription>5 artikel terakhir dibuat.</CardDescription>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/articles">
            Lihat semua
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {rows.length === 0 ? (
          <EmptyState
            label="Belum ada artikel."
            hint="Mulai dengan menambahkan artikel pertama Anda."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[110px] text-right">Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="max-w-[260px]">
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="block truncate font-medium text-foreground hover:text-amber-600 hover:underline"
                    >
                      {a.title}
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                      {a.categoryName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                    {fmtRelative(a.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function TopArticlesTable({ rows }: { rows: ArticleRow[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">Paling Banyak Dibaca</CardTitle>
          <CardDescription>Top 5 artikel berdasarkan views.</CardDescription>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/articles">
            Lihat semua
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {rows.length === 0 ? (
          <EmptyState
            label="Belum ada data views."
            hint="Views akan terkumpul otomatis saat artikel dibaca pembaca."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead className="w-[110px] text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a, i) => (
                <TableRow key={a.id}>
                  <TableCell className="font-bold text-amber-500 tabular-nums">
                    {i + 1}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="block truncate font-medium text-foreground hover:text-amber-600 hover:underline"
                    >
                      {a.title}
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                      {a.categoryName} · {fmtDate(a.publishedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1 font-medium tabular-nums">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      {a.viewCount.toLocaleString('id-ID')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-1 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page (server)                                                              */
/* -------------------------------------------------------------------------- */

export default async function OverviewPage() {
  // Aggregate stats in parallel — wrapped in try/catch to prevent 500 crash
  // if any DB query fails (Supabase cold start, RLS edge case, etc.)
  let totalArticles = 0
  let publishedArticles = 0
  let draftArticles = 0
  let archivedArticles = 0
  let totalViewsAgg: { _sum: { viewCount?: number } } = { _sum: {} }
  let activeSubscribers = 0
  let pendingComments = 0
  let recentArticles: any[] = []
  let topArticles: any[] = []
  let allArticlesForChart: any[] = []
  let categoriesWithArticles: any[] = []
  // Product & variant stats
  let totalProducts = 0
  let totalVariants = 0
  let activeProducts = 0
  let recentVariants: any[] = []
  let allVariants: any[] = []
  let allProducts: any[] = []
  // Analytics stats
  let totalPageViews = 0
  let totalWaClicks = 0
  let totalVariantClicks = 0
  let recentComments: any[] = []

  try {
    ;([
      totalArticles,
      publishedArticles,
      draftArticles,
      archivedArticles,
      totalViewsAgg,
      activeSubscribers,
      pendingComments,
      recentArticles,
      topArticles,
      allArticlesForChart,
      categoriesWithArticles,
      // Product & variant queries
      totalProducts,
      totalVariants,
      activeProducts,
      recentVariants,
      allVariants,
      allProducts,
      // Analytics queries
      totalPageViews,
      totalWaClicks,
      totalVariantClicks,
      recentComments,
    ] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { status: 'PUBLISHED' } }),
      db.article.count({ where: { status: 'DRAFT' } }),
      db.article.count({ where: { status: 'ARCHIVED' } }),
      db.article.aggregate({ _sum: { viewCount: true } }),
      db.subscriber.count({ where: { status: 'ACTIVE' } }),
      db.comment.count({ where: { status: 'PENDING' } }),
      db.article.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { category: { select: { name: true } } },
      }),
      db.article.findMany({
        orderBy: { viewCount: 'desc' },
        take: 5,
        include: { category: { select: { name: true } } },
      }),
      db.article.findMany({
        where: {
          OR: [
            { publishedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) } },
            { publishedAt: null, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) } },
          ],
        },
        select: { publishedAt: true, createdAt: true },
      }),
      db.category.findMany({
        orderBy: { order: 'asc' },
        include: { articles: { select: { viewCount: true } } },
      }),
      // Product & variant queries
      (db.product.count() as any),
      (db.productVariant.count() as any),
      (db.product.count({ where: { isActive: true } } as any)),
      (db.productVariant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, name: true, slug: true, tier: true, price: true,
          ribbonLabel: true, ribbonColor: true, isActive: true,
          createdAt: true, productId: true,
        },
      } as any)),
      (db.productVariant.findMany({
        select: { id: true, tier: true, slug: true, name: true, productId: true },
      } as any)),
      (db.product.findMany({
        select: { id: true, name: true, slug: true },
      } as any)),
      // Analytics queries
      (db.pageView.count() as any),
      (db.waClick.count() as any),
      (db.variantClick.count() as any),
      (db.comment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, articleId: true, authorName: true, content: true, createdAt: true, status: true },
      } as any)),
    ] as any[]))
  } catch (err) {
    console.error('[admin/overview] DB query failed:', err)
    // Fallback: render page with zeros & empty arrays
  }

  const totalViews = totalViewsAgg._sum.viewCount ?? 0

  // Build last 12 months buckets (id-ID short month labels)
  const now = new Date()
  const monthlyMap = new Map<string, MonthlyPoint>()
  const monthlyData: MonthlyPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'short' })
    const point: MonthlyPoint = { month: label, count: 0 }
    monthlyMap.set(key, point)
    monthlyData.push(point)
  }
  for (const a of allArticlesForChart) {
    const d = a.publishedAt ?? a.createdAt
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const point = monthlyMap.get(key)
    if (point) point.count += 1
  }

  // Views per category (sum viewCount of its articles)
  const categoryViews: CategorySlice[] = (categoriesWithArticles || [])
    .map((c: any) => ({
      name: c.name,
      views: (c.articles || []).reduce((sum: number, a: any) => sum + (a.viewCount || 0), 0),
    }))
    .filter((c) => c.views > 0)
    .sort((a, b) => b.views - a.views)

  // Serialize articles for client tables (we keep them as plain objects)
  const recentRows: ArticleRow[] = (recentArticles || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    status: a.status,
    categoryName: a.category?.name ?? '—',
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : (a.createdAt ?? new Date().toISOString()),
    viewCount: a.viewCount ?? 0,
    publishedAt: a.publishedAt instanceof Date ? a.publishedAt.toISOString() : (a.publishedAt ?? null),
  }))

  const topRows: ArticleRow[] = (topArticles || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    status: a.status,
    categoryName: a.category?.name ?? '—',
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : (a.createdAt ?? new Date().toISOString()),
    viewCount: a.viewCount ?? 0,
    publishedAt: a.publishedAt instanceof Date ? a.publishedAt.toISOString() : (a.publishedAt ?? null),
  }))

  // === Product & Variant data processing ===
  const productMap = new Map<string, string>()
  for (const p of allProducts || []) {
    productMap.set(p.id, p.name)
  }

  // Tier distribution for donut chart
  const tierCounts = new Map<string, number>()
  for (const v of allVariants || []) {
    tierCounts.set(v.tier, (tierCounts.get(v.tier) || 0) + 1)
  }
  const tierData = Array.from(tierCounts.entries()).map(([tier, count]) => ({ tier, count }))

  // Recent variants rows (with parent product name)
  const recentVariantRows = (recentVariants || []).map((v: any) => ({
    id: v.id,
    parentName: productMap.get(v.productId) || '—',
    variantName: v.name,
    tier: v.tier,
    ribbonLabel: v.ribbonLabel,
    ribbonColor: v.ribbonColor,
    price: v.price,
    isActive: v.isActive,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : (v.createdAt ?? new Date().toISOString()),
    productId: v.productId,
  }))

  // Top variants by views (from page_views where pageType='variant')
  // Since we can't easily aggregate page_views server-side in mock mode,
  // we'll use variant clicks as a proxy for popularity
  const variantClickCounts = new Map<string, number>()
  // Count views per variant slug from all page views
  // This is a simplified approach - in production would use SQL GROUP BY
  const topVariantRows = (allVariants || [])
    .map((v: any) => ({
      variantId: v.id,
      variantName: v.name,
      parentName: productMap.get(v.productId) || '—',
      slug: v.slug,
      tier: v.tier,
    }))
    .slice(0, 5)

  // Activity timeline (merge variants, articles, comments — sort by date desc)
  type ActivityItem = {
    type: 'variant' | 'article' | 'comment'
    title: string
    subtitle: string
    date: string
    href: string
  }
  const activities: ActivityItem[] = []

  for (const v of recentVariants || []) {
    const dt = v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt
    if (dt) {
      activities.push({
        type: 'variant',
        title: `Varian "${v.name}" ditambah`,
        subtitle: productMap.get(v.productId) || 'Produk',
        date: dt,
        href: `/admin/products/${v.productId}/variants/${v.id}/edit`,
      })
    }
  }
  for (const a of recentArticles || []) {
    const dt = a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt
    if (dt) {
      activities.push({
        type: 'article',
        title: `Artikel "${a.title}" ${a.status === 'PUBLISHED' ? 'dipublikasi' : 'dibuat'}`,
        subtitle: a.category?.name ?? '—',
        date: dt,
        href: `/admin/articles/${a.id}/edit`,
      })
    }
  }
  for (const c of recentComments || []) {
    const dt = c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
    if (dt) {
      activities.push({
        type: 'comment',
        title: `Komentar baru dari "${c.authorName ?? 'Anonim'}"`,
        subtitle: (c.content ?? '').slice(0, 60) + '...',
        date: dt,
        href: '/admin/comments',
      })
    }
  }
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const recentActivities = activities.slice(0, 10)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Page heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Overview Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan statistik & aktivitas portal Peredam Mobil Jakarta.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Diperbarui {ID_DATE.format(now)}
        </div>
      </div>

      {/* Stat cards — 8 cards (4 artikel + 4 produk/analytics) */}
      <section
        aria-label="Statistik utama"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <StatCard
          label="Total Artikel"
          value={totalArticles}
          hint={`${draftArticles} draft`}
          icon={FileText}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          iconColor="text-white"
          href="/admin/articles"
        />
        <StatCard
          label="Published"
          value={publishedArticles}
          hint="Artikel aktif"
          icon={CheckCircle2}
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
          iconColor="text-white"
          href="/admin/articles"
        />
        <StatCard
          label="Total Produk"
          value={totalProducts}
          hint={`${activeProducts} aktif`}
          icon={Package}
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          iconColor="text-white"
          href="/admin/products"
        />
        <StatCard
          label="Total Varian"
          value={totalVariants}
          hint="Basic/Normal/Best Buy/Rec."
          icon={Layers}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          iconColor="text-white"
          href="/admin/variants"
        />
        <StatCard
          label="Page Views"
          value={(totalPageViews || totalViews).toLocaleString('id-ID')}
          hint="Total tracking"
          icon={Eye}
          gradient="bg-gradient-to-br from-slate-700 to-slate-900"
          iconColor="text-red-300"
          href="/admin/analytics"
        />
        <StatCard
          label="WA Clicks"
          value={totalWaClicks}
          hint="Tombol WhatsApp"
          icon={MessageSquare}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          iconColor="text-white"
          href="/admin/analytics/engagement"
        />
        <StatCard
          label="Subscribers"
          value={activeSubscribers}
          hint="Aktif"
          icon={Mail}
          gradient="bg-gradient-to-br from-orange-500 to-rose-600"
          iconColor="text-white"
          href="/admin/subscribers"
        />
        <StatCard
          label="Komentar Pending"
          value={pendingComments}
          hint="Perlu moderasi"
          icon={MessageSquare}
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
          iconColor="text-white"
          href="/admin/comments"
        />
      </section>

      {/* Charts row */}
      <section
        aria-label="Grafik"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Artikel Dipublikasi per Bulan</CardTitle>
            <CardDescription>12 bulan terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyArticlesChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Views per Kategori</CardTitle>
            <CardDescription>Distribusi views artikel.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryViewsPie data={categoryViews} />
          </CardContent>
        </Card>
      </section>

      {/* Quick actions */}
      <QuickActions />

      {/* Tables row — Artikel */}
      <section
        aria-label="Tabel artikel"
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <RecentArticlesTable rows={recentRows} />
        <TopArticlesTable rows={topRows} />
      </section>

      {/* Varian per Tier donut chart + Varian Terbaru table */}
      <section
        aria-label="Statistik produk & varian"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Varian per Tier</CardTitle>
            <CardDescription>Distribusi varian per tingkatan.</CardDescription>
          </CardHeader>
          <CardContent>
            <TierDonutChart data={tierData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex h-full flex-col">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Varian Produk Terbaru</CardTitle>
              <CardDescription>5 varian terakhir ditambahkan.</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/variants">
                Lihat semua
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {recentVariantRows.length === 0 ? (
              <EmptyState
                label="Belum ada varian."
                hint="Tambahkan varian pertama dari menu Produk."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Produk / Varian</TableHead>
                    <TableHead className="w-[90px]">Tier</TableHead>
                    <TableHead className="w-[120px]">Harga</TableHead>
                    <TableHead className="w-[80px] text-right">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVariantRows.map((v, i) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-bold text-red-500 tabular-nums">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/products/${v.productId}/variants/${v.id}/edit`}
                          className="block truncate font-medium text-foreground hover:text-red-600 hover:underline"
                        >
                          {v.variantName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground">
                          {v.parentName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          v.ribbonColor === 'slate' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300' :
                          v.ribbonColor === 'blue' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300' :
                          v.ribbonColor === 'amber' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300' :
                          v.ribbonColor === 'emerald' ? 'bg-gold/10 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {v.ribbonLabel || v.tier}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {v.price}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                        {fmtRelative(v.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Aktivitas Terbaru timeline */}
      <section aria-label="Aktivitas terbaru">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
            <CardDescription>10 aktivitas terakhir (varian, artikel, komentar).</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <EmptyState
                label="Belum ada aktivitas."
                hint="Aktivitas akan muncul saat ada penambahan/modifikasi konten."
              />
            ) : (
              <ul className="space-y-3">
                {recentActivities.map((act, idx) => {
                  const iconMap = {
                    variant: { icon: Layers, color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' },
                    article: { icon: FileText, color: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' },
                    comment: { icon: MessageSquare, color: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' },
                  }
                  const { icon: Icon, color } = iconMap[act.type]
                  return (
                    <li key={idx}>
                      <Link
                        href={act.href}
                        className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className={`shrink-0 rounded-md p-2 ${color}`}>
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {act.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {act.subtitle}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                          {fmtRelative(act.date)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer mini-stats */}
      <section className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <MiniStat
          icon={FileText}
          label="Drafts"
          value={draftArticles}
          color="text-slate-500"
        />
        <MiniStat
          icon={Archive}
          label="Arsip"
          value={archivedArticles}
          color="text-slate-500"
        />
        <MiniStat
          icon={MessageSquare}
          label="Komentar Pending"
          value={pendingComments}
          color="text-amber-600"
          href="/admin/comments"
        />
        <MiniStat
          icon={Send}
          label="Subscriber Aktif"
          value={activeSubscribers}
          color="text-gold"
          href="/admin/subscribers"
        />
      </section>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-colors hover:bg-muted/40">
      <Icon className={cn('h-4 w-4', color)} aria-hidden />
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="font-semibold text-foreground tabular-nums">
          {value.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  )
  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}
