import Link from 'next/link'
import { ChevronRight, Package } from 'lucide-react'

/**
 * PaketSummary — 4 card summary di landing page (#paket-audio)
 *
 * Setiap card link ke /paket/[category] (halaman terpisah).
 * User klik → lihat semua varian kategori tersebut di halaman dedicated.
 *
 * 4 kategori:
 *  1. Simple Upgrade    → /paket/simple-upgrade       (4 varian, Rp 3-9jt)
 *  2. Entry Level       → /paket/entry                (16 varian, Rp 10-27jt)
 *  3. Daily Use         → /paket/daily-use            (32 varian, Rp 22-54jt)
 *  4. Affordable High End → /paket/affordable-high-end (32 varian, Rp 31-80jt)
 */

const CATEGORIES = [
  {
    slug: 'simple-upgrade',
    label: 'Simple Upgrade',
    description: 'Paket upgrade audio untuk pemula. Solusi terjangkau dengan kualitas di atas speaker bawaan.',
    priceRange: 'Rp 3.3jt - 9.3jt',
    variantCount: 4,
    color: 'slate',
    gradient: 'from-slate-600 to-slate-800',
  },
  {
    slug: 'entry',
    label: 'Entry Level',
    description: 'Paket audio dengan komponen aftermarket. Mulai pakai amplifier dan DSP tuning.',
    priceRange: 'Rp 10jt - 26.6jt',
    variantCount: 16,
    color: 'blue',
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    slug: 'daily-use',
    label: 'Daily Use',
    description: 'Paket audio untuk penggunaan harian dengan kualitas premium. Comfort untuk dengar harian.',
    priceRange: 'Rp 21.7jt - 54jt',
    variantCount: 32,
    color: 'amber',
    gradient: 'from-amber-600 to-amber-800',
  },
  {
    slug: 'affordable-high-end',
    label: 'Affordable High End',
    description: 'Paket audio premium untuk audiophile. Komponen brand Eropa, DSP competition grade.',
    priceRange: 'Rp 31jt - 80jt',
    variantCount: 32,
    color: 'emerald',
    gradient: 'from-emerald-600 to-emerald-800',
  },
]

export function PaketSummary() {
  return (
    <section
      id="paket-audio"
      className="border-t border-border bg-background"
    >
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20">
        {/* Section header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-wider text-gold mb-4">
            <Package className="size-3" />
            84 Varian Tersedia
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Paket Layanan
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Pilih kategori paket sesuai kebutuhan &amp; budget mobil Anda.
            Setiap kategori punya 4 tier: Basic, Normal, Best Buy, Recommended.
          </p>
        </div>

        {/* 4 Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/paket/${cat.slug}`}
              className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-gold/40 transition-all hover:-translate-y-1"
            >
              {/* Top gradient bar */}
              <div className={`h-2 bg-gradient-to-r ${cat.gradient}`} />

              {/* Content */}
              <div className="flex flex-col flex-1 p-5 sm:p-6">
                {/* Category label */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {cat.label}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {cat.description}
                </p>

                {/* Stats */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Varian:</span>
                    <span className="font-bold text-foreground">{cat.variantCount} paket</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Range Harga:</span>
                    <span className="font-bold text-gold">{cat.priceRange}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tier:</span>
                    <span className="font-bold text-foreground text-xs">4 (Basic → Recommended)</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-bold text-gold group-hover:text-gold-light transition-colors">
                    Lihat Paket
                  </span>
                  <ChevronRight className="size-4 text-gold group-hover:translate-x-1 group-hover:text-gold-light transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Bingung pilih paket?{' '}
            <a
              href="https://wa.me/6282211222989?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi%20paket%20audio%20mobil"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gold hover:text-gold-light underline underline-offset-2"
            >
              Konsultasi gratis via WhatsApp →
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
