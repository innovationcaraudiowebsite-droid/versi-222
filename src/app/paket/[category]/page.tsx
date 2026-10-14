import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Package } from 'lucide-react'
import { db } from '@/lib/db'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'
import { ProductsGrid, type ProductVariantItem } from '@/components/landing/products-grid'

/**
 * Halaman kategori paket — /paket/[category]
 *
 * 4 kategori:
 *  - /paket/simple-upgrade       (4 varian)
 *  - /paket/entry                (16 varian)
 *  - /paket/daily-use            (32 varian)
 *  - /paket/affordable-high-end  (32 varian)
 *
 * Setiap halaman menampilkan SEMUA varian kategori tersebut dalam grid.
 * Urutan: Recommended → Best Buy → Normal → Basic (paling laku di awal).
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ============================================================
// Category config
// ============================================================
interface CategoryConfig {
  slug: string
  label: string
  shortLabel: string
  description: string
  color: 'slate' | 'blue' | 'amber' | 'emerald'
  productSlugPrefix: string
  priceRange: string
  variantCount: number
}

const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'simple-upgrade',
    label: 'Simple Upgrade',
    shortLabel: 'Simple Upgrade',
    description: 'Paket upgrade audio mobil untuk pemula. Solusi terjangkau dengan kualitas di atas speaker bawaan pabrik.',
    color: 'slate',
    productSlugPrefix: 'simple-upgrade',
    priceRange: 'Rp 3.3jt - 9.3jt',
    variantCount: 4,
  },
  {
    slug: 'entry',
    label: 'Entry Level',
    shortLabel: 'Entry',
    description: 'Paket audio mobil dengan komponen aftermarket. Mulai pakai amplifier dan DSP untuk kualitas di atas average.',
    color: 'blue',
    productSlugPrefix: 'entry-',
    priceRange: 'Rp 10jt - 26.6jt',
    variantCount: 16,
  },
  {
    slug: 'daily-use',
    label: 'Daily Use',
    shortLabel: 'Daily Use',
    description: 'Paket audio mobil untuk penggunaan harian dengan kualitas premium. Comfort untuk dengar harian tanpa lelah.',
    color: 'amber',
    productSlugPrefix: 'daily-use-',
    priceRange: 'Rp 21.7jt - 54jt',
    variantCount: 32,
  },
  {
    slug: 'affordable-high-end',
    label: 'Affordable High End',
    shortLabel: 'AHE',
    description: 'Paket audio mobil premium untuk audiophile. Komponen brand Eropa dengan DSP tuning competition grade.',
    color: 'emerald',
    productSlugPrefix: 'affordable-high-end-',
    priceRange: 'Rp 31jt - 80jt',
    variantCount: 32,
  },
]

// ============================================================
// generateStaticParams — pre-render 4 kategori pages
// ============================================================
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

// ============================================================
// generateMetadata — SEO per kategori
// ============================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: catSlug } = await params
  const cat = CATEGORIES.find((c) => c.slug === catSlug)

  if (!cat) {
    return { title: 'Kategori Paket Tidak Ditemukan' }
  }

  return {
    title: `Paket ${cat.label} — ${cat.priceRange} | Innovation Car Audio Jakarta`,
    description: `${cat.description} ${cat.variantCount} varian tersedia dengan 4 tier (Basic, Normal, Best Buy, Recommended). Konsultasi gratis via WhatsApp.`,
    keywords: [
      `paket ${cat.label.toLowerCase()}`,
      'audio mobil',
      'audio car',
      'innovation car audio',
      'jakarta',
      cat.label.toLowerCase(),
    ],
    openGraph: {
      title: `Paket ${cat.label} — Innovation Car Audio Jakarta`,
      description: cat.description,
    },
  }
}

// ============================================================
// Get variants for category
// ============================================================
async function getCategoryVariants(cat: CategoryConfig): Promise<ProductVariantItem[]> {
  try {
    // Ambil semua produk aktif, lalu filter manual dengan startsWith.
    // (local-data.ts fallback tidak support startsWith di semua versi)
    const allProducts = await db.product.findMany({
      where: { isActive: true },
    })

    // Filter manual berdasarkan slug prefix
    const products = (allProducts || []).filter((p) =>
      p.slug && p.slug.startsWith(cat.productSlugPrefix)
    )

    if (!products || products.length === 0) return []

    const productIds = products.map((p) => p.id)

    const variants = await db.productVariant.findMany({
      where: {
        productId: { in: productIds },
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    if (!variants || variants.length === 0) return []

    return variants.map((v) => {
      const parent = products.find((p) => p.id === v.productId)
      return {
        ...v,
        parentName: parent?.name,
        parentSlug: parent?.slug,
        category: parent?.category,
        waNumber: parent?.waNumber,
      } as ProductVariantItem
    })
  } catch (err) {
    console.error(`[paket/${cat.slug}] fetch error:`, err)
    return []
  }
}

// ============================================================
// Page component
// ============================================================
export default async function PaketCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: catSlug } = await params
  const cat = CATEGORIES.find((c) => c.slug === catSlug)

  if (!cat) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <LandingHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Kategori tidak ditemukan</h1>
            <p className="mt-2 text-muted-foreground">
              Kategori &quot;{catSlug}&quot; tidak tersedia.
            </p>
            <Link
              href="/#paket-audio"
              className="mt-4 inline-flex items-center gap-1 text-gold hover:text-gold-light"
            >
              ← Kembali ke Paket Audio
            </Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    )
  }

  const variants = await getCategoryVariants(cat)

  const breadcrumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Paket Audio', href: '/#paket-audio' },
    { label: cat.label, href: `/paket/${cat.slug}` },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5" />}
                <Link href={b.href} className="hover:text-foreground transition-colors">
                  {b.label}
                </Link>
              </span>
            ))}
          </nav>

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-wider text-gold mb-4">
              <Package className="size-3" />
              {cat.variantCount} Varian Tersedia
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Paket {cat.label}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
              {cat.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                <span className="text-muted-foreground">Range Harga:</span>
                <span className="font-bold text-gold">{cat.priceRange}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                <span className="text-muted-foreground">Varian:</span>
                <span className="font-bold">{variants.length} paket</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                <span className="text-muted-foreground">Tier:</span>
                <span className="font-bold">Basic, Normal, Best Buy, Recommended</span>
              </span>
            </div>
          </div>

          {/* Other categories — quick nav */}
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center mr-1">Kategori lain:</span>
            {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/paket/${c.slug}`}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-gold/40 hover:bg-muted transition-colors"
              >
                {c.shortLabel}
                <ChevronRight className="size-3" />
              </Link>
            ))}
          </div>

          {/* Products grid */}
          {variants.length > 0 ? (
            <ProductsGrid
              variants={variants}
              categoryLabel={cat.label}
              categoryColor={cat.color}
            />
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                Belum ada varian tersedia untuk kategori ini.
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-gold to-gold-dark p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Bingung pilih paket?
            </h2>
            <p className="text-white/80 mb-4 text-sm sm:text-base">
              Konsultasi gratis dengan teknisi kami. Dapatkan rekomendasi sesuai kebutuhan dan budget Anda.
            </p>
            <a
              href="https://wa.me/6282211222989?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi%20paket%20audio%20mobil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-black hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
            >
              💬 Konsultasi WhatsApp
            </a>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
