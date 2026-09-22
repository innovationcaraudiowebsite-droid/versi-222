'use client'

import Link from 'next/link'
import { Package, Layers, TrendingUp, DollarSign, Star, Activity, ArrowUp, ArrowDown } from 'lucide-react'

interface ProductRow {
  id: string
  name: string
  slug: string
  category: string
  isActive: boolean
}

interface VariantRow {
  id: string
  productId: string
  name: string
  tier: string
  price: string
  priceValue: number | null
  isActive: boolean
  ribbonLabel: string | null
  ribbonColor: string | null
  galleryImages: string[]
  cardTitle: string | null
}

interface StatisticsViewProps {
  products: ProductRow[]
  variants: VariantRow[]
}

export function StatisticsView({ products, variants }: StatisticsViewProps) {
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.isActive).length
  const totalVariants = variants.length
  const activeVariants = variants.filter((v) => v.isActive).length

  // Tier distribution
  const tierCounts = {
    basic: variants.filter((v) => v.tier === 'basic').length,
    normal: variants.filter((v) => v.tier === 'normal').length,
    best_buy: variants.filter((v) => v.tier === 'best_buy').length,
    recommended: variants.filter((v) => v.tier === 'recommended').length,
  }

  // Category distribution
  const categoryMap = new Map<string, number>()
  for (const p of products) {
    categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1)
  }

  // Price stats (only variants with priceValue)
  const pricesNumeric = variants
    .map((v) => v.priceValue)
    .filter((v): v is number => v !== null && v > 0)
  const minPrice = pricesNumeric.length > 0 ? Math.min(...pricesNumeric) : 0
  const maxPrice = pricesNumeric.length > 0 ? Math.max(...pricesNumeric) : 0
  const avgPrice = pricesNumeric.length > 0
    ? Math.round(pricesNumeric.reduce((a, b) => a + b, 0) / pricesNumeric.length)
    : 0

  // Variants per product (top 5)
  const variantCountPerProduct = products
    .map((p) => ({
      ...p,
      variantCount: variants.filter((v) => v.productId === p.id).length,
    }))
    .sort((a, b) => b.variantCount - a.variantCount)
    .slice(0, 5)

  // Format rupiah
  const formatRp = (val: number) => {
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`
    if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}rb`
    return `Rp ${val}`
  }

  const formatRpFull = (val: number) => `Rp ${val.toLocaleString('id-ID')}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistik Produk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview produk & varian. Tracking view counts dan konversi WhatsApp akan tersedia setelah Supabase Analytics ter-connect.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Produk"
          value={totalProducts}
          subtext={`${activeProducts} aktif`}
          icon={Package}
          color="amber"
        />
        <StatCard
          label="Total Varian"
          value={totalVariants}
          subtext={`${activeVariants} aktif`}
          icon={Layers}
          color="blue"
        />
        <StatCard
          label="Harga Termurah"
          value={formatRp(minPrice)}
          subtext={formatRpFull(minPrice)}
          icon={ArrowDown}
          color="emerald"
        />
        <StatCard
          label="Harga Termahal"
          value={formatRp(maxPrice)}
          subtext={formatRpFull(maxPrice)}
          icon={ArrowUp}
          color="rose"
        />
      </div>

      {/* Tier distribution */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="size-4 text-amber-500" />
          <h2 className="text-lg font-bold tracking-tight">Distribusi Tier</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TierBar label="Basic" count={tierCounts.basic} total={totalVariants} color="slate" />
          <TierBar label="Normal" count={tierCounts.normal} total={totalVariants} color="blue" />
          <TierBar label="Best Buy" count={tierCounts.best_buy} total={totalVariants} color="amber" />
          <TierBar label="Recommended" count={tierCounts.recommended} total={totalVariants} color="emerald" />
        </div>
      </div>

      {/* Category distribution */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="size-4 text-blue-500" />
          <h2 className="text-lg font-bold tracking-tight">Distribusi Kategori</h2>
        </div>
        {categoryMap.size === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada produk.</p>
        ) : (
          <div className="space-y-2">
            {Array.from(categoryMap.entries()).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(count / totalProducts) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top products by variant count */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-emerald-500" />
          <h2 className="text-lg font-bold tracking-tight">Produk dengan Varian Terbanyak</h2>
        </div>
        {variantCountPerProduct.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada produk.</p>
        ) : (
          <div className="space-y-2">
            {variantCountPerProduct.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="text-sm font-semibold text-muted-foreground w-6">#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="font-medium text-foreground hover:text-brand dark:hover:text-brand-light transition-colors"
                  >
                    {p.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-semibold">
                    {p.variantCount} varian
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price analysis */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="size-4 text-amber-500" />
          <h2 className="text-lg font-bold tracking-tight">Analisis Harga</h2>
        </div>
        {pricesNumeric.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada harga numeric ter-set.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Harga Rata-rata</div>
              <div className="mt-1 text-xl font-bold text-foreground">{formatRpFull(avgPrice)}</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Range Harga</div>
              <div className="mt-1 text-sm font-bold text-foreground">
                {formatRpFull(minPrice)} – {formatRpFull(maxPrice)}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Varian dengan Harga</div>
              <div className="mt-1 text-xl font-bold text-foreground">
                {pricesNumeric.length} <span className="text-xs font-normal text-muted-foreground">dari {totalVariants}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mock mode notice */}
      <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
        <div className="flex items-start gap-3">
          <Activity className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-amber-800 dark:text-amber-300">Mock Mode Aktif</div>
            <p className="mt-1 text-amber-700 dark:text-amber-400">
              Statistik di atas menggunakan data dari <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900">data/backup-sqlite.json</code>.
              View counts per varian, click-through rate, dan konversi WhatsApp akan tersedia setelah Supabase Analytics terhubung.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: typeof Package
  color: 'amber' | 'blue' | 'emerald' | 'rose'
}

function StatCard({ label, value, subtext, icon: Icon, color }: StatCardProps) {
  const colors = {
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    blue: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold truncate">{label}</div>
          <div className="mt-1 text-2xl font-bold text-foreground truncate">{value}</div>
          {subtext && <div className="mt-0.5 text-xs text-muted-foreground truncate">{subtext}</div>}
        </div>
        <div className={`shrink-0 rounded-md p-2 ${colors[color]}`}>
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  )
}

interface TierBarProps {
  label: string
  count: number
  total: number
  color: 'slate' | 'blue' | 'amber' | 'emerald'
}

function TierBar({ label, count, total, color }: TierBarProps) {
  const colors = {
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold">{count}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${colors[color]} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{pct}% dari total</div>
    </div>
  )
}
