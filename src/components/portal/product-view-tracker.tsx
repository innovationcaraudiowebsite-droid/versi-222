'use client'

import { useEffect } from 'react'

/**
 * ProductViewTracker — track page view untuk variant detail page.
 *
 * Trigger POST /api/track/page-view saat component mount (setelah hydration).
 * Fire & forget — tidak menunggu response, tidak block UI.
 *
 * Sumber tracking:
 *  - pageType: 'variant'
 *  - pageSlug: slug variant (untuk agregasi views per variant)
 */
export function ProductViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire & forget — tidak perlu await
    fetch('/api/track/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageType: 'variant',
        pageSlug: slug,
      }),
    }).catch(() => {
      // Silent fail — tracking error tidak boleh ganggu UX
    })
  }, [slug])

  return null // Tidak render apa-apa
}

/**
 * trackVariantClick — trigger saat user klik card variant di carousel/sibling/related.
 *
 * Dipanggil dari onClick handler di ProductVariantCard atau Link dengan custom onClick.
 */
export function trackVariantClick(variantId: string, source: 'carousel' | 'sibling' | 'related' | 'search') {
  fetch('/api/track/variant-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variantId, source }),
  }).catch(() => {})
}

/**
 * trackWAClick — trigger saat user klik tombol "Tanya via WhatsApp".
 *
 * Dipanggil dari onClick handler di WA button.
 */
export function trackWAClick(variantId: string) {
  fetch('/api/track/wa-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variantId }),
  }).catch(() => {})
}
