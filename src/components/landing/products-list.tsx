'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

/**
 * ProductsList — client component untuk render CAROUSEL ProductVariant.
 *
 * PRINSIP (sesuai brief user, mirror articles-list.tsx):
 *  - 1 card per varian (15 card total untuk 5 produk × 3 varian)
 *  - Tampil 4 card per batch (1 col mobile / 2x2 desktop)
 *  - Saat scroll/swipe = MENGGESER varian selanjutnya (slide animation)
 *
 * CARD LAYOUT:
 *  - Ribbon/badge di pojok kanan atas (warna sesuai tier)
 *  - Mini image carousel (4+ gambar per varian, swipeable)
 *  - Card title (konfigurasi)
 *  - Card description (2-line)
 *  - Price + tier label
 *
 * RIBBON COLOR MAP (sesuai tier):
 *  - basic       → slate (gray)
 *  - normal      → blue
 *  - best_buy    → amber (gold)
 *  - recommended → emerald (green)
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
  // Parent info (joined)
  parentName?: string
  parentSlug?: string
  category?: string
  waNumber?: string
}

interface ProductsListProps {
  variants: ProductVariantItem[]
}

const VISIBLE_COUNT = 4
const CARD_GAP = 16 // px (gap-4 = 1rem = 16px)

// ============================================================
// Ribbon color mapping (Tailwind classes)
// ============================================================
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

function getRibbonStyle(color: string | null) {
  if (!color) return RIBBON_STYLES.slate
  return RIBBON_STYLES[color] || RIBBON_STYLES.slate
}

// ============================================================
// Mini Image Carousel — untuk gallery di dalam card
// ============================================================
function MiniImageCarousel({
  images,
  alt,
  variantId,
}: {
  images: string[]
  alt: string
  variantId: string
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const total = images.length

  const next = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + total) % total)
  }, [total])

  // Touch swipe untuk mobile
  const onTouchStart = (e: React.TouchEvent) => {
    ;(e.currentTarget as HTMLElement).dataset.touchStartY = String(e.touches[0].clientY)
    ;(e.currentTarget as HTMLElement).dataset.touchStartX = String(e.touches[0].clientX)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement
    const startX = Number(el.dataset.touchStartX || 0)
    const startY = Number(el.dataset.touchStartY || 0)
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = startX - endX
    const deltaY = startY - endY
    // Hanya trigger kalau swipe lebih horizontal dari vertikal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      if (deltaX > 0) next()
      else prev()
    }
  }

  if (total === 0) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-brand/30 to-brand-dark/40 grid place-items-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
          Peredam Mobil
        </span>
      </div>
    )
  }

  return (
    <div
      className="relative w-full aspect-video bg-muted overflow-hidden group/img"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Image track (transform translateX) */}
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: `translateX(-${currentIdx * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="relative w-full h-full shrink-0">
            <Image
              src={img}
              alt={`${alt} - ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Arrow buttons (desktop hover) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
            aria-label="Gambar berikutnya"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIdx(idx)
              }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIdx
                  ? 'w-4 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Gambar ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter "1/4" di pojok kanan atas (di bawah ribbon) */}
      {total > 1 && (
        <div className="absolute top-2 right-2 rounded-full bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 pointer-events-none">
          {currentIdx + 1}/{total}
        </div>
      )}
    </div>
  )
}

// ============================================================
// ProductVariant Card
// ============================================================
function ProductVariantCard({ v }: { v: ProductVariantItem }) {
  const ribbon = getRibbonStyle(v.ribbonColor)
  const displayTitle = v.cardTitle || v.name
  const displayImage = v.imageUrl || v.galleryImages[0] || null
  const gallery = v.galleryImages.length > 0 ? v.galleryImages : displayImage ? [displayImage] : []

  return (
    <li className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:border-brand/40 flex flex-col relative">
      {/* Ribbon badge — pojok kanan atas (absolute, di atas image) */}
      {v.ribbonLabel && (
        <div className={`absolute top-3 right-3 z-10 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${ribbon.bg} ${ribbon.text} ${ribbon.border}`}>
          {v.ribbonLabel}
        </div>
      )}

      {/* Mini Image Carousel (gallery) */}
      <MiniImageCarousel
        images={gallery}
        alt={v.imageAlt || displayTitle}
        variantId={v.id}
      />

      {/* Konten bawah */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Parent product name (kecil di atas) */}
        {v.parentName && (
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {v.parentName}
          </div>
        )}

        {/* Card title (konfigurasi) */}
        <h3 className="mt-1 text-sm sm:text-base font-bold leading-snug line-clamp-2">
          {displayTitle}
        </h3>

        {/* Card description */}
        {v.cardDescription && (
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {v.cardDescription}
          </p>
        )}

        {/* Footer card: price + tier label */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground line-through opacity-0 hidden">placeholder</div>
            <div className="text-sm sm:text-base font-bold text-brand dark:text-brand-light truncate">
              {v.price}
            </div>
            {v.priceNote && (
              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                {v.priceNote}
              </div>
            )}
          </div>
          {/* Tier label kecil di kanan */}
          <div className={`shrink-0 inline-flex items-center rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${ribbon.bg} ${ribbon.text}`}>
            {v.tier.replace('_', ' ')}
          </div>
        </div>
      </div>
    </li>
  )
}

// ============================================================
// Main ProductsList — Carousel 4-card per batch
// ============================================================
export function ProductsList({ variants }: ProductsListProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const gridRef = useRef<HTMLUListElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  const total = variants.length
  const totalBatches = Math.ceil(total / VISIBLE_COUNT)
  const maxPageIndex = Math.max(0, totalBatches - 1)
  const canNext = pageIndex < maxPageIndex
  const canPrev = pageIndex > 0

  const nextBatch = useCallback(() => {
    setPageIndex((prev) => Math.min(prev + 1, maxPageIndex))
  }, [maxPageIndex])

  const prevBatch = useCallback(() => {
    setPageIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  // Measure container height (responsive terhadap viewport)
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const measure = () => {
      const children = Array.from(grid.children) as HTMLElement[]
      if (children.length === 0) return

      if (children.length <= VISIBLE_COUNT) {
        setContainerHeight(null)
        return
      }

      const firstChild = children[0]
      const nextBatchFirstChild = children[VISIBLE_COUNT]
      if (firstChild && nextBatchFirstChild) {
        const batchHeight =
          nextBatchFirstChild.offsetTop - firstChild.offsetTop - CARD_GAP
        if (batchHeight > 0) setContainerHeight(batchHeight)
      }
    }

    requestAnimationFrame(measure)

    const ro = new ResizeObserver(() => requestAnimationFrame(measure))
    ro.observe(grid)
    return () => ro.disconnect()
  }, [variants])

  // Auto-advance via wheel (desktop) + touch (Android/iOS) dengan throttle 500ms
  useEffect(() => {
    if (total <= VISIBLE_COUNT) return

    const section = document.getElementById('paket')
    if (!section) return

    let lastTrigger = 0
    const COOLDOWN = 500
    const TOUCH_THRESHOLD = 50

    const isSectionVisible = () => {
      const rect = section.getBoundingClientRect()
      return (
        rect.top < window.innerHeight * 0.5 &&
        rect.bottom > window.innerHeight * 0.5
      )
    }

    const tryAdvance = (direction: 'next' | 'prev') => {
      const now = Date.now()
      if (now - lastTrigger < COOLDOWN) return
      if (!isSectionVisible()) return
      lastTrigger = now
      if (direction === 'next') nextBatch()
      else prevBatch()
    }

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) tryAdvance('next')
      else if (e.deltaY < 0) tryAdvance('prev')
    }

    let touchStartY = 0
    let touchStartX = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
      touchStartX = e.touches[0]?.clientX ?? 0
    }
    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? 0
      const endX = e.changedTouches[0]?.clientX ?? 0
      const deltaY = touchStartY - endY
      const deltaX = touchStartX - endX
      // Hanya trigger kalau swipe lebih vertikal dari horizontal
      // (horizontal swipe = untuk mini image carousel di card)
      if (Math.abs(deltaY) < Math.abs(deltaX)) return
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return
      if (deltaY > 0) tryAdvance('next')
      else tryAdvance('prev')
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [nextBatch, prevBatch, total])

  if (total === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Belum ada produk aktif.
      </div>
    )
  }

  // Edge case: total ≤ 4 → render statik tanpa carousel
  if (total <= VISIBLE_COUNT) {
    return (
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {variants.map((v) => (
          <ProductVariantCard key={v.id} v={v} />
        ))}
      </ul>
    )
  }

  const visibleStart = pageIndex * VISIBLE_COUNT + 1
  const visibleEnd = Math.min((pageIndex + 1) * VISIBLE_COUNT, total)
  const isLastBatch = !canNext

  return (
    <>
      {/* Carousel container */}
      <div
        className="mt-6 overflow-hidden"
        style={{
          height: containerHeight !== null ? `${containerHeight}px` : undefined,
        }}
      >
        <ul
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-transform duration-500 ease-out relative"
          style={{
            transform: `translateY(-${pageIndex * (containerHeight ?? 0)}px)`,
          }}
        >
          {variants.map((v) => (
            <ProductVariantCard key={v.id} v={v} />
          ))}
        </ul>
      </div>

      {/* Navigation indicator + tombol prev/next */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={prevBatch}
          disabled={!canPrev}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-3.5" />
          Sebelumnya
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Produk {visibleStart}-{visibleEnd} dari {total}
          </span>
          <div className="h-1 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(visibleEnd / total) * 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={nextBatch}
          disabled={!canNext}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          Berikutnya
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* End state */}
      {isLastBatch && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Sampai produk terakhir
        </div>
      )}
    </>
  )
}
