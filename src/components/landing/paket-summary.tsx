'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Package } from 'lucide-react'

/**
 * PaketSummary — 4 card summary di landing page (#paket-audio)
 *
 * Card features (per user spec):
 *  - AI-generated image per kategori (1024x1024)
 *  - Ribbon miring top-left corner (45°) — "POPULAR", "BEST VALUE", dll
 *  - Warna card berbeda per kategori
 *  - Animasi: hover lift + image zoom + ribbon shine + button shimmer
 *    + count-up stats + entrance fade-in
 *
 * 4 kategori:
 *  1. Simple Upgrade    → /paket/simple-upgrade       (4 varian)
 *  2. Entry Level       → /paket/entry                (16 varian)
 *  3. Daily Use         → /paket/daily-use            (32 varian)
 *  4. Affordable High End → /paket/affordable-high-end (32 varian)
 */

// ============================================================
// Count-up animation hook
// ============================================================
function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    let startTime: number | null = null
    let rafId: number

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, start])

  return count
}

// ============================================================
// Intersection Observer hook for entrance animation
// ============================================================
function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.unobserve(element)
      }
    }, { threshold: 0.2, ...options })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

// ============================================================
// Category config
// ============================================================
const CATEGORIES = [
  {
    slug: 'simple-upgrade',
    label: 'Simple Upgrade',
    description: 'Paket upgrade audio untuk pemula. Solusi terjangkau dengan kualitas di atas speaker bawaan.',
    priceRange: 'Rp 3.3jt - 9.3jt',
    priceMin: 3.3,
    priceMax: 9.3,
    variantCount: 4,
    image: '/paket-images/simple-upgrade.png',
    ribbon: 'ENTRY',
    gradient: 'from-slate-600 to-slate-800',
    accentColor: 'slate',
    glowColor: 'shadow-slate-500/30',
    borderHover: 'hover:border-slate-400',
  },
  {
    slug: 'entry',
    label: 'Entry Level',
    description: 'Paket audio dengan komponen aftermarket. Mulai pakai amplifier dan DSP tuning.',
    priceRange: 'Rp 10jt - 26.6jt',
    priceMin: 10,
    priceMax: 26.6,
    variantCount: 16,
    image: '/paket-images/entry-level.png',
    ribbon: 'POPULAR',
    gradient: 'from-blue-600 to-blue-800',
    accentColor: 'blue',
    glowColor: 'shadow-blue-500/30',
    borderHover: 'hover:border-blue-400',
  },
  {
    slug: 'daily-use',
    label: 'Daily Use',
    description: 'Paket audio untuk penggunaan harian dengan kualitas premium. Comfort untuk dengar harian.',
    priceRange: 'Rp 21.7jt - 54jt',
    priceMin: 21.7,
    priceMax: 54,
    variantCount: 32,
    image: '/paket-images/daily-use.png',
    ribbon: 'BEST VALUE',
    gradient: 'from-amber-600 to-amber-800',
    accentColor: 'amber',
    glowColor: 'shadow-amber-500/30',
    borderHover: 'hover:border-amber-400',
  },
  {
    slug: 'affordable-high-end',
    label: 'Affordable High End',
    description: 'Paket audio premium untuk audiophile. Komponen brand Eropa, DSP competition grade.',
    priceRange: 'Rp 31jt - 80jt',
    priceMin: 31,
    priceMax: 80,
    variantCount: 32,
    image: '/paket-images/affordable-high-end.png',
    ribbon: 'PREMIUM',
    gradient: 'from-emerald-600 to-emerald-800',
    accentColor: 'emerald',
    glowColor: 'shadow-emerald-500/30',
    borderHover: 'hover:border-emerald-400',
  },
]

// ============================================================
// PaketCard — individual card with AI image + ribbon + animations
// ============================================================
function PaketCard({ cat, index }: { cat: typeof CATEGORIES[0]; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const variantCount = useCountUp(cat.variantCount, 1500, inView)

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease-out ${index * 0.15}s, transform 0.6s ease-out ${index * 0.15}s`,
      }}
    >
      <Link
        href={`/paket/${cat.slug}`}
        className={`block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-2xl ${cat.glowColor} ${cat.borderHover} hover:-translate-y-2 transition-all duration-500`}
      >
        {/* Image area with ribbon */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cat.image}
            alt={`Paket ${cat.label}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Ribbon miring top-left corner (45°) */}
          <div className="absolute top-0 left-0 overflow-hidden w-32 h-32 pointer-events-none">
            <div
              className={`absolute top-4 left-[-1.75rem] bg-gradient-to-r ${cat.gradient} text-white text-[10px] font-bold uppercase tracking-wider py-1 px-10 shadow-lg whitespace-nowrap`}
              style={{ transform: 'rotate(-45deg)' }}
            >
              {/* Shine effect on ribbon */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative">{cat.ribbon}</span>
            </div>
          </div>

          {/* Category label on image (bottom) */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">
              {cat.label}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {cat.description}
          </p>

          {/* Stats with count-up animation */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Varian</div>
              <div className="text-lg font-bold text-foreground">
                {variantCount}
                <span className="text-xs font-normal text-muted-foreground ml-1">paket</span>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Range Harga</div>
              <div className="text-sm font-bold text-gold">
                {cat.priceRange}
              </div>
            </div>
          </div>

          {/* Tier info */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Tier:</span>
            <div className="flex gap-1">
              {['Basic', 'Normal', 'Best Buy', 'Recommended'].map((tier, i) => (
                <span
                  key={tier}
                  className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground"
                >
                  {tier}
                </span>
              ))}
            </div>
          </div>

          {/* CTA button with shimmer */}
          <div className="mt-5 relative overflow-hidden rounded-lg">
            <div className={`relative flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${cat.gradient} px-4 py-3 text-sm font-bold text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Lihat Paket</span>
              <ChevronRight className="relative size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ============================================================
// Main component
// ============================================================
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
          {CATEGORIES.map((cat, i) => (
            <PaketCard key={cat.slug} cat={cat} index={i} />
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
