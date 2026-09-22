'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

/**
 * ProductsList — client component untuk render CAROUSEL produk (Paket Layanan).
 *
 * PRINSIP (sesuai brief user, mirror articles-list.tsx):
 *  - Tampil produk maksimal 4 (VISIBLE_COUNT = 4).
 *  - Saat scroll/swipe = MENGGESER produk selanjutnya (slide animation),
 *    BUKAN reload/fetch API.
 *  - Aslinya banyak (max 50 produk pre-loaded dari DB), tapi terlihat hanya 4.
 *  - Posisi sticky/fixed — container tetap, konten slide di dalamnya.
 *
 * LAYOUT RESPONSIVE:
 *  - Mobile (≤640px): 1 kolom × 4 baris = 4 card visible (vertikal stack)
 *  - Tablet/Desktop (>640px): 2 kolom × 2 baris = 4 card visible (grid 2×2)
 *  - Slide step = 4 produk per batch (pageIndex 0,1,2,...)
 *
 * Card layout: VERTICAL (gambar atas aspect-video + konten bawah)
 *  - Badge kategori
 *  - Title (line-clamp-1)
 *  - Description (line-clamp-2)
 *
 * Behavior:
 *  - Desktop: mouse wheel down → next 4, wheel up → prev 4.
 *  - Mobile (Android/iOS): touch swipe up → next 4, swipe down → prev 4.
 *  - Tombol Sebelumnya/Berikutnya untuk manual control.
 *  - Cooldown 500ms supaya 1 gesture = 1 slide (tidak rapid-fire).
 *  - Indicator: "Produk 1-4 dari N" + progress bar.
 *  - End state: tombol Berikutnya disabled, "✓ Sampai produk terakhir".
 *  - Empty slots di batch terakhir: hanya render sisa card (no placeholder).
 */

export type ProductItem = {
  id: string
  name: string
  description: string | null
  category: string
  imageUrl: string | null
  imageAlt: string | null
  sortOrder: number
}

interface ProductsListProps {
  products: ProductItem[]
}

const VISIBLE_COUNT = 4
const CARD_GAP = 16 // px (gap-4 = 1rem = 16px)

function ProductCard({ p }: { p: ProductItem }) {
  return (
    <li className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:border-brand/40 flex flex-col">
      {/* Gambar atas — aspect-video (16:9, lebih compact daripada square) */}
      <div className="relative w-full aspect-video bg-muted border-b border-border">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.imageAlt || p.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand/30 to-brand-dark/40">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
              Peredam Mobil
            </span>
          </div>
        )}
      </div>

      {/* Konten bawah */}
      <div className="p-3 sm:p-4 flex-1">
        {/* Badge kategori */}
        <span className="inline-block rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand dark:text-brand-light">
          {p.category}
        </span>

        {/* Title (1-line clamp) */}
        <h3 className="mt-1.5 text-base sm:text-lg font-bold leading-snug line-clamp-1">
          {p.name}
        </h3>

        {/* Deskripsi (2-line clamp) */}
        {p.description && (
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {p.description}
          </p>
        )}
      </div>
    </li>
  )
}

export function ProductsList({ products }: ProductsListProps) {
  const [pageIndex, setPageIndex] = useState(0) // index batch yang visible
  const gridRef = useRef<HTMLUListElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  const total = products.length
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

  // Measure container height (responsive terhadap viewport).
  // Batch height = jarak dari child[0] ke child[VISIBLE_COUNT] dikurangi 1 gap.
  // Pada mobile (1 col): child[4] ada di row 5 → containerHeight = 4×cardH + 3×gap
  // Pada desktop (2 col): child[4] ada di row 3 → containerHeight = 2×cardH + 1×gap
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const measure = () => {
      const children = Array.from(grid.children) as HTMLElement[]
      if (children.length === 0) return

      if (children.length <= VISIBLE_COUNT) {
        // Semua produk muat di 1 batch, no slide needed
        setContainerHeight(null)
        return
      }

      // Measure pakai child ke-VISIBLE_COUNT (0-indexed, jadi child index = VISIBLE_COUNT = 4)
      // yaitu child ke-5 yang merupakan awal batch berikutnya.
      const firstChild = children[0]
      const nextBatchFirstChild = children[VISIBLE_COUNT]
      if (firstChild && nextBatchFirstChild) {
        const batchHeight =
          nextBatchFirstChild.offsetTop - firstChild.offsetTop - CARD_GAP
        if (batchHeight > 0) setContainerHeight(batchHeight)
      }
    }

    // Defer to next frame supaya grid sudah di-layout
    requestAnimationFrame(measure)

    const ro = new ResizeObserver(() => requestAnimationFrame(measure))
    ro.observe(grid)
    return () => ro.disconnect()
  }, [products])

  // Auto-advance via wheel (desktop) + touch (Android/iOS) dengan throttle 500ms.
  // Hanya aktif jika total produk > VISIBLE_COUNT (perlu slide).
  useEffect(() => {
    if (total <= VISIBLE_COUNT) return

    const section = document.getElementById('paket')
    if (!section) return

    let lastTrigger = 0
    const COOLDOWN = 500 // ms — minimal jarak antar slide
    const TOUCH_THRESHOLD = 50 // px — minimal swipe distance

    const isSectionVisible = () => {
      const rect = section.getBoundingClientRect()
      // Section dianggap "active" jika tengah section ada di viewport
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

    // Desktop: mouse wheel
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) tryAdvance('next')
      else if (e.deltaY < 0) tryAdvance('prev')
    }

    // Mobile (Android/iOS): touch swipe
    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
    }
    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? 0
      const deltaY = touchStartY - endY // positive = swipe up = scroll down
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return // too small, ignore
      if (deltaY > 0) tryAdvance('next') // swipe up → next batch
      else tryAdvance('prev') // swipe down → prev batch
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
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </ul>
    )
  }

  const visibleStart = pageIndex * VISIBLE_COUNT + 1
  const visibleEnd = Math.min((pageIndex + 1) * VISIBLE_COUNT, total)
  const isLastBatch = !canNext

  return (
    <>
      {/* Carousel container — overflow:hidden, dynamic height (responsive).
          Inner track di-translate dengan CSS transform (NO reload). */}
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
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </ul>
      </div>

      {/* Navigation indicator + tombol prev/next — SETELAH carousel. */}
      <div className="mt-6 flex items-center justify-between gap-4">
        {/* Tombol Sebelumnya */}
        <button
          type="button"
          onClick={prevBatch}
          disabled={!canPrev}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-3.5" />
          Sebelumnya
        </button>

        {/* Indicator: "Produk 1-4 dari N" + progress bar */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Produk {visibleStart}-{visibleEnd} dari {total}
          </span>
          {/* Progress bar */}
          <div className="h-1 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(visibleEnd / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Tombol Berikutnya */}
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

      {/* End state — sudah sampai produk terakhir */}
      {isLastBatch && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Sampai produk terakhir
        </div>
      )}
    </>
  )
}
