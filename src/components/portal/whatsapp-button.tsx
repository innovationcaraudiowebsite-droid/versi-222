'use client'

import { MessageCircle } from 'lucide-react'
import { trackWAClick } from '@/components/portal/product-view-tracker'

/**
 * WhatsAppButton — tombol "Tanya via WhatsApp" dengan tracking analytics.
 *
 * Saat di-klik, trigger POST /api/track/wa-click (fire & forget),
 * lalu buka wa.me link di tab baru.
 */
interface WhatsAppButtonProps {
  href: string
  variantId: string
  label?: string
  variant?: 'default' | 'outline'
  className?: string
}

export function WhatsAppButton({
  href,
  variantId,
  label = 'Tanya via WhatsApp',
  variant = 'default',
  className = '',
}: WhatsAppButtonProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Track click (fire & forget)
    trackWAClick(variantId)
    // Link akan tetap navigate (default browser behavior, target=_blank)
  }

  const baseClass =
    variant === 'default'
      ? 'inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 text-sm transition-colors'
      : 'inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card hover:bg-muted text-foreground font-semibold px-5 py-3 text-sm transition-colors'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${baseClass} ${className}`}
    >
      <MessageCircle className="size-4" />
      {label}
    </a>
  )
}
