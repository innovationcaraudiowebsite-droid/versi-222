'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

/**
 * ProductsGrid — grid layout untuk menampilkan varian produk di halaman kategori.
 *
 * Style KONSISTEN dengan PaketSummary (landing card):
 *  - Ribbon miring -45° (top-left corner) = TIER name
 *  - Ribbon warna sesuai tier (slate/blue/amber/emerald)
 *  - Ribbon shine effect on hover
 *  - Image zoom scale-110 (700ms) on hover
 *  - Card hover: -translate-y-2 + shadow-2xl + border color per kategori
 *  - CTA button: gradient bg + shimmer effect
 *  - Entrance: fade-in + translateY (staggered)
 *
 * Sort order: Recommended → Best Buy → Normal → Basic
 */

export type ProductVariantItem = {
  id: string
  productId: string
  name: string
  slug: string
  tier: 'basic' | 'normal' | 'best_buy' | 'recommended'
  sortOrder: number
  price: string
  priceValue: number | null
  priceNote: string | null
  ribbonLabel: string | null
  ribbonColor: string | null
  cardTitle: string | null
  cardDescription: string | null
  imageUrl: string | null
  imageAlt: string | null
  galleryImages: string[]
  parentName?: string
  parentSlug?: string
  category?: string
  waNumber?: string
}

interface ProductsGridProps {
  variants: ProductVariantItem[]
  categoryLabel: string
  categoryColor: 'slate' | 'blue' | 'amber' | 'emerald'
}

// Sort order: Recommended first (most popular), then Best Buy, Normal, Basic
const TIER_ORDER: Record<string, number> = {
  recommended: 0,
  best_buy: 1,
  normal: 2,
  basic: 3,
}

// Tier ribbon styles — miring, warna sesuai tier (match PaketSummary style)
const TIER_RIBBON: Record<
  string,
  { gradient: string; glow: string; borderHover: string; label: string }
> = {
  basic: {
    gradient: 'from-slate-600 to-slate-800',
    glow: 'shadow-slate-500/30',
    borderHover: 'hover:border-slate-400',
    label: 'BASIC',
  },
  normal: {
    gradient: 'from-blue-600 to-blue-800',
    glow: 'shadow-blue-500/30',
    borderHover: 'hover:border-blue-400',
    label: 'NORMAL',
  },
  best_buy: {
    gradient: 'from-amber-600 to-amber-800',
    glow: 'shadow-amber-500/30',
    borderHover: 'hover:border-amber-400',
    label: 'BEST BUY',
  },
  recommended: {
    gradient: 'from-emerald-600 to-emerald-800',
    glow: 'shadow-emerald-500/30',
    borderHover: 'hover:border-emerald-400',
    label: 'RECOMMENDED',
  },
}

// Category border accent (untuk konsistensi warna kategori di card border)
const CATEGORY_BORDER: Record<string, string> = {
  slate: 'hover:border-slate-400',
  blue: 'hover:border-blue-400',
  amber: 'hover:border-amber-400',
  emerald: 'hover:border-emerald-400',
}

// Tier badge styles (untuk tier list di body card)
const TIER_BADGE: Record<string, string> = {
  basic: 'bg-slate-600 text-white',
  normal: 'bg-blue-600 text-white',
  best_buy: 'bg-amber-600 text-white',
  recommended: 'bg-emerald-600 text-white',
}

const TIER_LABELS: Record<string, string> = {
  basic: 'BASIC',
  normal: 'NORMAL',
  best_buy: 'BEST BUY',
  recommended: 'RECOMMENDED',
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

// ============================================================
// ProductCard — individual card with diagonal ribbon + animations
// ============================================================
function ProductCard({
  v,
  categoryColor,
  index,
}: {
  v: ProductVariantItem
  categoryColor: 'slate' | 'blue' | 'amber' | 'emerald'
  index: number
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const tierInfo = TIER_RIBBON[v.tier] || TIER_RIBBON.basic

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease-out ${Math.min(index * 0.1, 0.6)}s, transform 0.6s ease-out ${Math.min(index * 0.1, 0.6)}s`,
      }}
    >
      <Link
        href={`/produk/${v.slug}`}
        className={`block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-2xl ${tierInfo.glow} ${CATEGORY_BORDER[categoryColor] || tierInfo.borderHover} hover:-translate-y-2 transition-all duration-500`}
      >
        {/* Image area with diagonal ribbon */}
        {v.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.imageUrl}
              alt={v.imageAlt || v.cardTitle || v.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Diagonal ribbon — top-left corner, miring -45° */}
            <div className="absolute top-0 left-0 overflow-hidden w-32 h-32 pointer-events-none">
              <div
                className={`absolute top-4 left-[-1.75rem] bg-gradient-to-r ${tierInfo.gradient} text-white text-[10px] font-bold uppercase tracking-wider py-1 px-10 shadow-lg whitespace-nowrap`}
                style={{ transform: 'rotate(-45deg)' }}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative">{tierInfo.label}</span>
              </div>
            </div>

            {/* Category badge — top-right (flat, smaller) */}
            <div className="absolute top-3 right-3 inline-flex items-center rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
              {/* Category color dot */}
              <span
                className={`size-1.5 rounded-full mr-1 ${
                  categoryColor === 'slate'
                    ? 'bg-slate-400'
                    : categoryColor === 'blue'
                      ? 'bg-blue-400'
                      : categoryColor === 'amber'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                }`}
              />
              {categoryColor === 'slate'
                ? 'Simple'
                : categoryColor === 'blue'
                  ? 'Entry'
                  : categoryColor === 'amber'
                    ? 'Daily'
                    : 'AHE'}
            </div>

            {/* Card title on image (bottom) */}
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-sm sm:text-base font-bold text-white drop-shadow-lg line-clamp-2 leading-snug">
                {v.cardTitle || v.name}
              </h3>
              {v.parentName && (
                <p className="mt-0.5 text-[10px] text-white/70 line-clamp-1">
                  {v.parentName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Tier label */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Tier:</span>
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${TIER_BADGE[v.tier] || 'bg-gray-600 text-white'}`}
            >
              {TIER_LABELS[v.tier] || v.tier}
            </span>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-border">
            <div className="text-lg sm:text-xl font-bold text-gold">
              {v.price}
            </div>
            {v.priceNote && (
              <p className="mt-0.5 text-[10px] text-muted-foreground italic line-clamp-1">
                *{v.priceNote}
              </p>
            )}
          </div>

          {/* CTA button with shimmer — match PaketSummary style */}
          <div className="mt-4 relative overflow-hidden rounded-lg">
            <div
              className={`relative flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${tierInfo.gradient} px-4 py-2.5 text-sm font-bold text-white shadow-lg group-hover:shadow-xl transition-shadow`}
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Lihat Detail</span>
              <ChevronRight className="relative size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ============================================================
// Main grid component
// ============================================================
export function ProductsGrid({ variants, categoryLabel, categoryColor }: ProductsGridProps) {
  // Sort: Recommended → Best Buy → Normal → Basic
  const sorted = [...variants].sort((a, b) => {
    const ta = TIER_ORDER[a.tier] ?? 99
    const tb = TIER_ORDER[b.tier] ?? 99
    if (ta !== tb) return ta - tb
    // Same tier → sort by price ascending
    return (a.priceValue ?? 0) - (b.priceValue ?? 0)
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {sorted.map((v, i) => (
        <ProductCard
          key={v.id}
          v={v}
          categoryColor={categoryColor}
          index={i}
        />
      ))}
    </div>
  )
}
