'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Package } from 'lucide-react'

/**
 * PeredamDetail — halaman detail paket peredam dengan accordion + checkbox.
 *
 * Features:
 *  - AI image + ribbon miring
 *  - Harga coret + harga akhir + badge hemat
 *  - Accordion: Detail Area Instalasi (expandable per area)
 *  - Accordion: Bahan yang Dipakai (table breakdown)
 *  - Checkbox: Item Optional (add-on, user bisa pilih)
 *  - Total harga update otomatis saat checkbox dipilih
 *  - CTA: Pesan via WhatsApp (dengan detail paket + add-on yang dipilih)
 */

interface PeredamDetailProps {
  pkg: Record<string, unknown>
  optionalItems: Array<Record<string, unknown>>
}

// Tier ribbon styles
const TIER_RIBBON: Record<string, { gradient: string; label: string }> = {
  basic: { gradient: 'from-slate-600 to-slate-800', label: 'BASIC' },
  normal: { gradient: 'from-blue-600 to-blue-800', label: 'NORMAL' },
  best_buy: { gradient: 'from-amber-600 to-amber-800', label: 'BEST BUY' },
  recommended: { gradient: 'from-emerald-600 to-emerald-800', label: 'RECOMMENDED' },
}

export function PeredamDetail({ pkg, optionalItems }: PeredamDetailProps) {
  const [expandedArea, setExpandedArea] = useState<number | null>(0)
  const [showMaterials, setShowMaterials] = useState(false)
  const [showOptional, setShowOptional] = useState(true)
  const [selectedAddons, setSelectedAddons] = useState<Set<number>>(new Set())

  const tier = String(pkg.tier || 'basic')
  const tierInfo = TIER_RIBBON[tier] || TIER_RIBBON.basic
  const areas = (pkg.areas as Array<Record<string, string>>) || []
  const materials = (pkg.materials as Array<Record<string, unknown>>) || []

  const name = String(pkg.name || '')
  const priceOriginal = String(pkg.priceOriginal || '')
  const priceFinal = String(pkg.priceFinal || '')
  const discount = String(pkg.discount || '')
  const discountAmount = String(pkg.discountAmount || '')
  const totalLayers = String(pkg.totalLayers || '')
  const image = String(pkg.image || '')
  const installCost = String(pkg.installCost || '')

  // Toggle add-on checkbox
  const toggleAddon = (idx: number) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  // Build WhatsApp message
  const waMessage = encodeURIComponent(
    `Halo Innovation Car Audio, saya ingin pesan paket peredam ${name} (${priceFinal})${
      selectedAddons.size > 0
        ? `\n\nAdd-on yang dipilih:\n${Array.from(selectedAddons).map((i) => `- ${optionalItems[i]?.name}`).join('\n')}`
        : ''
    }`
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* LEFT: Image + price */}
      <div>
        {/* Image with ribbon */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={`Peredam ${name}`} className="w-full h-full object-cover" />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Diagonal ribbon — top-left corner */}
          <div className="absolute top-0 left-0 overflow-hidden w-40 h-40 pointer-events-none">
            <div
              className={`absolute top-5 left-[-2rem] bg-gradient-to-r ${tierInfo.gradient} text-white text-xs font-bold uppercase tracking-wider py-1.5 px-12 shadow-lg whitespace-nowrap`}
              style={{ transform: 'rotate(-45deg)' }}
            >
              <span className="relative">{tierInfo.label}</span>
            </div>
          </div>

          {/* Category badge — top-right */}
          <div className="absolute top-4 right-4 inline-flex items-center rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <span className="size-2 rounded-full mr-1 bg-red-500" />
            Peredam Mobil
          </div>

          {/* Title on image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
              Peredam {name}
            </h1>
          </div>
        </div>

        {/* Price block */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Harga Paket</span>
          </div>

          {/* Original price (strikethrough) */}
          <div className="text-base text-muted-foreground line-through">
            {priceOriginal}
          </div>

          {/* Final price (after discount) */}
          <div className="text-3xl sm:text-4xl font-extrabold text-gold mt-1">
            {priceFinal}
          </div>

          {/* Discount badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs font-bold text-red-600">
            💰 Hemat {discount} ({discountAmount})
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Lembar</div>
              <div className="text-lg font-bold text-foreground">{totalLayers} lbr</div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Area Instalasi</div>
              <div className="text-lg font-bold text-foreground">{areas.length} area</div>
            </div>
          </div>

          {/* CTA: WhatsApp */}
          <a
            href={`https://wa.me/6282211222989?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            💬 Pesan via WhatsApp
          </a>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Konsultasi gratis · Respon cepat
          </p>
        </div>
      </div>

      {/* RIGHT: Details (accordion) */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Detail Paket</h2>

        {/* Accordion 1: Detail Area Instalasi */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedArea(expandedArea === -1 ? 0 : -1)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="font-bold text-sm">📍 Detail Area Instalasi ({areas.length} area)</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {/* Expand all areas */}
          <div className="divide-y divide-border">
            {areas.map((area, i) => (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setExpandedArea(expandedArea === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{area.area}</div>
                    <div className="text-[10px] text-muted-foreground">{area.layers}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gold">{area.subtotal}</span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${expandedArea === i ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedArea === i && (
                  <div className="px-4 pb-3 bg-muted/20">
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      <div>📍 Area: <span className="font-medium text-foreground">{area.area}</span></div>
                      <div>📦 Layer: <span className="font-medium text-foreground">{area.layers}</span></div>
                      <div>💰 Subtotal: <span className="font-medium text-gold">{area.subtotal}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Accordion 2: Bahan yang Dipakai */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMaterials(!showMaterials)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="font-bold text-sm">📦 Bahan yang Dipakai</span>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showMaterials ? 'rotate-180' : ''}`} />
          </button>

          {showMaterials && (
            <div className="px-4 pb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Bahan</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Harga</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((mat, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2">{String(mat.name || '')}</td>
                      <td className="py-2 text-right">{Number(mat.qty) || 0} lbr</td>
                      <td className="py-2 text-right text-muted-foreground">{String(mat.unitPrice || '')}</td>
                      <td className="py-2 text-right font-medium">{String(mat.total || '-')}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-border">
                    <td colSpan={3} className="py-2 text-right text-muted-foreground">Biaya Instalasi</td>
                    <td className="py-2 text-right font-medium">{installCost}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-bold">TOTAL</td>
                    <td className="py-2 text-right font-bold text-foreground">{priceOriginal}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1 text-right text-xs text-red-600">Diskon {discount}</td>
                    <td className="py-1 text-right text-xs text-red-600">-{discountAmount}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1 text-right font-bold text-gold">HARGA AKHIR</td>
                    <td className="py-1 text-right font-bold text-gold">{priceFinal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Accordion 3: Item Optional (Add-on with checkbox) */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="font-bold text-sm">➕ Item Optional (Add-on)</span>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showOptional ? 'rotate-180' : ''}`} />
          </button>

          {showOptional && (
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                Pilih item tambahan untuk lengkapi paket peredam Anda:
              </p>
              {optionalItems.map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedAddons.has(i)}
                    onChange={() => toggleAddon(i)}
                    className="mt-1 size-4 rounded border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{String(item.name || '')}</span>
                      <span className="text-sm font-bold text-gold">{String(item.price || '')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {String(item.description || '')}
                    </p>
                  </div>
                </label>
              ))}

              {/* Selected add-ons summary */}
              {selectedAddons.size > 0 && (
                <div className="mt-3 rounded-lg bg-gold/10 border border-gold/30 p-3">
                  <div className="text-xs font-bold text-gold mb-1">
                    ✅ {selectedAddons.size} add-on dipilih
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Add-on akan diikutsertakan saat pesan via WhatsApp
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="pt-4">
          <Link
            href="/paket/peredam"
            className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-light transition-colors"
          >
            ← Kembali ke Paket Peredam
          </Link>
        </div>
      </div>
    </div>
  )
}
