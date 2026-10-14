'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

/**
 * PeredamGrid — grid layout untuk menampilkan 4 tier paket peredam.
 *
 * Style KONSISTEN dengan ProductsGrid (paket audio):
 *  - Ribbon miring -45° (top-left corner) = TIER name
 *  - Ribbon warna sesuai tier (slate/blue/amber/emerald)
 *  - Ribbon shine effect on hover
 *  - Image zoom scale-110 (700ms) on hover
 *  - Card hover: -translate-y-2 + shadow-2xl + border color per tier
 *  - CTA button: gradient bg + shimmer effect
 *  - Entrance: fade-in + translateY (staggered)
 *
 * Card menampilkan:
 *  - AI image per tier
 *  - Harga coret + harga akhir + badge diskon
 *  - Total lembar bahan
 */

export type PeredamArea = {
  area: string
  layers: string
  subtotal: string
}

export type PeredamMaterial = {
  name: string
  qty: number
  unitPrice: string
  total: string
}

export type PeredamPackage = {
  tier: string
  name: string
  slug: string
  priceOriginal: string
  priceFinal: string
  discount: string
  discountAmount: string
  totalLayers: number
  image: string
  areas: PeredamArea[]
  materials: PeredamMaterial[]
  installCost: string
}

interface PeredamGridProps {
  packages: PeredamPackage[]
}

// Tier ribbon styles — miring, warna sesuai tier
const TIER_RIBBON: Record<string, { gradient: string; glow: string; borderHover: string; label: string }> = {
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

// Sort order: Basic → Normal → Best Buy → Recommended
const TIER_ORDER: Record<string, number> = {
  basic: 0,
  normal: 1,
  best_buy: 2,
  recommended: 3,
}

// Intersection Observer hook
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

function PeredamCard({ pkg, index }: { pkg: PeredamPackage; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const tierInfo = TIER_RIBBON[pkg.tier] || TIER_RIBBON.basic

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
        href={`/peredam/${pkg.slug}`}
        className={`block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-2xl ${tierInfo.glow} ${tierInfo.borderHover} hover:-translate-y-2 transition-all duration-500`}
      >
        {/* Image area with diagonal ribbon */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkg.image}
            alt={`Peredam ${pkg.name}`}
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
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative">{tierInfo.label}</span>
            </div>
          </div>

          {/* Category badge — top-right */}
          <div className="absolute top-3 right-3 inline-flex items-center rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
            <span className="size-1.5 rounded-full mr-1 bg-red-500" />
            Peredam
          </div>

          {/* Title on image (bottom) */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-lg">
              Peredam {pkg.name}
            </h3>
            <p className="mt-0.5 text-[10px] text-white/70">
              {pkg.totalLayers} lembar bahan
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Price with strikethrough */}
          <div className="space-y-1">
            {/* Original price (strikethrough) */}
            <div className="text-xs text-muted-foreground line-through">
              {pkg.priceOriginal}
            </div>
            {/* Final price (after discount) */}
            <div className="text-xl sm:text-2xl font-bold text-gold">
              {pkg.priceFinal}
            </div>
            {/* Discount badge */}
            <div className="inline-flex items-center gap-1 rounded-md bg-red-600/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
              💰 Hemat {pkg.discount} ({pkg.discountAmount})
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Total Lembar</div>
              <div className="text-sm font-bold text-foreground">{pkg.totalLayers} lbr</div>
            </div>
            <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Area</div>
              <div className="text-sm font-bold text-foreground">{pkg.areas.length} area</div>
            </div>
          </div>

          {/* CTA button */}
          <div className="mt-4 relative overflow-hidden rounded-lg">
            <div className={`relative flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${tierInfo.gradient} px-4 py-2.5 text-sm font-bold text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
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

export function PeredamGrid({ packages }: PeredamGridProps) {
  // Sort: Basic → Normal → Best Buy → Recommended
  const sorted = [...packages].sort((a, b) => {
    const ta = TIER_ORDER[a.tier] ?? 99
    const tb = TIER_ORDER[b.tier] ?? 99
    return ta - tb
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {sorted.map((pkg, i) => (
        <PeredamCard key={pkg.slug} pkg={pkg} index={i} />
      ))}
    </div>
  )
}
