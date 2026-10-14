'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ChevronRight } from 'lucide-react'

/**
 * ProductsGrid — grid layout untuk menampilkan varian produk di halaman kategori.
 *
 * Berbeda dari ProductsList (carousel), ini menampilkan SEMUA varian dalam grid.
 *
 * Card layout (per user spec):
 *  [KATEGORI] ← ribbon kategori (warna sesuai kategori)
 *  cardTitle (konfigurasi)
 *  Tier: BASIC ← tier label
 *  Rp xxx.xxx.xxx ← harga
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

// Ribbon styles per category
const RIBBON_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-700',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
}

// Tier badge styles
const TIER_STYLES: Record<string, string> = {
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

export function ProductsGrid({ variants, categoryLabel, categoryColor }: ProductsGridProps) {
  // Sort: Recommended → Best Buy → Normal → Basic
  const sorted = [...variants].sort((a, b) => {
    const ta = TIER_ORDER[a.tier] ?? 99
    const tb = TIER_ORDER[b.tier] ?? 99
    if (ta !== tb) return ta - tb
    // Same tier → sort by price ascending
    return (a.priceValue ?? 0) - (b.priceValue ?? 0)
  })

  const ribbon = RIBBON_STYLES[categoryColor]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {sorted.map((v) => (
        <Link
          key={v.id}
          href={`/produk/${v.slug}`}
          className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-gold/40 transition-all"
        >
          {/* Image */}
          {v.imageUrl && (
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.imageUrl}
                alt={v.imageAlt || v.cardTitle || v.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Category ribbon — top-left, shows kategori clearly */}
              <div className={`absolute top-3 left-3 inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${ribbon.bg} ${ribbon.text} ${ribbon.border}`}>
                {categoryLabel}
              </div>
              {/* Tier badge — top-right */}
              <div className={`absolute top-3 right-3 inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${TIER_STYLES[v.tier] || 'bg-gray-600 text-white'}`}>
                {TIER_LABELS[v.tier] || v.tier}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col flex-1 p-4">
            {/* Card title (konfigurasi) */}
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
              {v.cardTitle || v.name}
            </h3>

            {/* Parent product name (sub-title) */}
            {v.parentName && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {v.parentName}
              </p>
            )}

            {/* Tier label */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tier:</span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${TIER_STYLES[v.tier] || 'bg-gray-600 text-white'}`}>
                {TIER_LABELS[v.tier] || v.tier}
              </span>
            </div>

            {/* Price */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-lg sm:text-xl font-bold text-gold">
                {v.price}
              </div>
              {v.priceNote && (
                <p className="mt-0.5 text-[10px] text-muted-foreground italic line-clamp-1">
                  *{v.priceNote}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gold group-hover:text-gold-light transition-colors">
              Lihat Detail
              <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
