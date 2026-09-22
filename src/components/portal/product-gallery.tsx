'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * ProductGallery — main image + thumbnail row (e-commerce style).
 *
 * Layout:
 *  - Main image: large display, aspect-video
 *  - Thumbnail row: clickable small images below main
 *  - Arrow buttons on main image (desktop hover)
 *  - Touch swipe support (mobile)
 *  - Counter "1/4" di pojok kanan atas
 *
 * Props:
 *  - images: string[] (URL list)
 *  - alt: string (image alt text)
 */
interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const total = images.length

  const next = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + total) % total)
  }, [total])

  // Touch swipe for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    ;(e.currentTarget as HTMLElement).dataset.touchStartX = String(e.touches[0].clientX)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement
    const startX = Number(el.dataset.touchStartX || 0)
    const endX = e.changedTouches[0].clientX
    const deltaX = startX - endX
    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) next()
      else prev()
    }
  }

  if (total === 0) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-brand/30 to-brand-dark/40 grid place-items-center rounded-lg">
        <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
          Peredam Mobil Jakarta
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main image with arrows */}
      <div
        className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={images[currentIdx]}
          alt={`${alt} - Gambar ${currentIdx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
          priority={currentIdx === 0}
        />

        {/* Arrow buttons (desktop hover) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Gambar berikutnya"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Counter "1/4" */}
        {total > 1 && (
          <div className="absolute top-3 right-3 rounded-full bg-black/60 text-white text-xs font-medium px-2.5 py-1 pointer-events-none">
            {currentIdx + 1} / {total}
          </div>
        )}

        {/* Dots indicator */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Gambar ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail row */}
      {total > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                idx === currentIdx
                  ? 'border-brand ring-2 ring-brand/30'
                  : 'border-border hover:border-brand/40 opacity-70 hover:opacity-100'
              }`}
              aria-label={`Lihat gambar ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${alt} - Thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 25vw, 100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
