'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GalleryUpload } from '@/components/admin/products/gallery-upload'
import { SectionBuilder } from '@/components/admin/products/section-builder'

interface ProductOption {
  id: string
  name: string
  slug: string
  category: string
}

interface VariantFormProps {
  mode: 'create' | 'edit'
  product: ProductOption
  initial?: {
    id: string
    name: string
    slug: string
    tier: string
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
    tagline: string | null
    introMarkdown: string | null
    sections: Array<{
      title: string
      type: 'markdown' | 'list' | 'subsections'
      markdown?: string
      items?: string[]
      subsections?: Array<{ title: string; subtitle?: string | null; markdown: string }>
    }> | null
    closingTagline: string | null
    closingComponents: string[] | null
    disclaimer: string | null
    isActive: boolean
  } | null
}

const TIER_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'normal', label: 'Normal' },
  { value: 'best_buy', label: 'Best Buy' },
  { value: 'recommended', label: 'Recommended' },
]

const RIBBON_COLOR_OPTIONS = [
  { value: 'slate', label: 'Slate (Basic)' },
  { value: 'blue', label: 'Blue (Popular)' },
  { value: 'amber', label: 'Amber (Best Buy)' },
  { value: 'emerald', label: 'Emerald (Recommended)' },
]

const DEFAULT_RIBBON: Record<string, { label: string; color: string }> = {
  basic: { label: 'BASIC', color: 'slate' },
  normal: { label: 'POPULAR', color: 'blue' },
  best_buy: { label: 'BEST BUY', color: 'amber' },
  recommended: { label: 'RECOMMENDED', color: 'emerald' },
}

type Tab = 'identitas' | 'card' | 'artikel' | 'seo'

const TABS: Array<{ id: Tab; label: string; icon: typeof Eye }> = [
  { id: 'identitas', label: '1. Identitas', icon: Eye },
  { id: 'card', label: '2. Card', icon: Eye },
  { id: 'artikel', label: '3. Artikel', icon: Eye },
  { id: 'seo', label: '4. SEO', icon: Eye },
]

export function VariantForm({ mode, product, initial }: VariantFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('identitas')
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState(initial?.name || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [tier, setTier] = useState(initial?.tier || 'basic')
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder || 1)
  const [ribbonLabel, setRibbonLabel] = useState(initial?.ribbonLabel || 'BASIC')
  const [ribbonColor, setRibbonColor] = useState(initial?.ribbonColor || 'slate')
  const [price, setPrice] = useState(initial?.price || '')
  const [priceValue, setPriceValue] = useState<string>(
    initial?.priceValue !== null && initial?.priceValue !== undefined ? String(initial.priceValue) : '',
  )
  const [priceNote, setPriceNote] = useState(initial?.priceNote || 'Harga non-diskon mengikuti harga yang tercantum pada brosur')
  const [cardTitle, setCardTitle] = useState(initial?.cardTitle || '')
  const [cardDescription, setCardDescription] = useState(initial?.cardDescription || '')
  const [galleryImages, setGalleryImages] = useState<string[]>(initial?.galleryImages || [])
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt || '')
  const [tagline, setTagline] = useState(initial?.tagline || 'Innovation Car Audio Jakarta')
  const [introMarkdown, setIntroMarkdown] = useState(initial?.introMarkdown || '')
  const [sections, setSections] = useState(
    initial?.sections || [
      { title: 'A. PRODUK UTAMA', type: 'list' as const, items: [] },
      { title: 'B. KABEL, PILAR & BOX', type: 'list' as const, items: [] },
      { title: 'C. JASA INSTALASI & TUNING', type: 'list' as const, items: [] },
    ],
  )
  const [closingTagline, setClosingTagline] = useState(initial?.closingTagline || '')
  const [closingComponentsText, setClosingComponentsText] = useState(
    (initial?.closingComponents || []).join('\n'),
  )
  const [disclaimer, setDisclaimer] = useState(initial?.disclaimer || 'Harga non-diskon mengikuti harga yang tercantum pada brosur')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)

  // Auto-update ribbon when tier changes
  function handleTierChange(newTier: string) {
    setTier(newTier)
    const defaults = DEFAULT_RIBBON[newTier]
    if (defaults) {
      setRibbonLabel(defaults.label)
      setRibbonColor(defaults.color)
    }
  }

  // Auto-generate slug from name + product slug
  function handleNameChange(newName: string) {
    setName(newName)
    if (!initial || mode === 'create') {
      const cleanName = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const cleanTier = tier.replace('_', '-')
      setSlug(`${product.slug}-${cleanTier}`)
    }
  }

  // SEO preview (computed)
  const seoTitle = `${cardTitle || name} — ${product.category} | Innovation Car Audio Jakarta`
  const seoDescription = (cardDescription || introMarkdown || '').slice(0, 160)
  const seoUrl = `/produk/${slug}`
  const seoKeywords = [
    ...(closingComponentsText.split('\n').filter(Boolean)),
    tier.replace('_', ' '),
    name,
    product.name,
    product.category,
    'Innovation Car Audio Jakarta',
  ].filter(Boolean).join(', ')

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Nama varian wajib diisi')
      setActiveTab('identitas')
      return
    }
    if (!slug.trim()) {
      toast.error('Slug wajib diisi')
      setActiveTab('identitas')
      return
    }
    if (!price.trim()) {
      toast.error('Harga wajib diisi')
      setActiveTab('identitas')
      return
    }

    setSaving(true)
    try {
      const payload = {
        productId: product.id,
        name,
        slug,
        tier,
        sortOrder: Number(sortOrder),
        ribbonLabel,
        ribbonColor,
        price,
        priceValue: priceValue ? Number(priceValue) : null,
        priceNote: priceNote || null,
        cardTitle: cardTitle || null,
        cardDescription: cardDescription || null,
        imageUrl: galleryImages[0] || null,
        imageAlt: imageAlt || null,
        galleryImages,
        tagline: tagline || null,
        introMarkdown: introMarkdown || null,
        sections,
        closingTagline: closingTagline || null,
        closingComponents: closingComponentsText.split('\n').map((s) => s.trim()).filter(Boolean),
        disclaimer: disclaimer || null,
        isActive,
      }

      const url = mode === 'create'
        ? `/api/admin/products/${product.id}/variants`
        : `/api/admin/products/${product.id}/variants/${initial!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Gagal menyimpan varian')
      }

      toast.success(mode === 'create' ? 'Varian berhasil dibuat' : 'Varian berhasil diupdate')
      router.push(`/admin/products/${product.id}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan varian')
      console.error('[variant-form] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/admin/products/${product.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Kembali ke {product.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === 'create' ? 'Tambah Varian Baru' : 'Edit Varian'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Produk induk: <strong>{product.name}</strong> ({product.category})
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-brand text-brand dark:text-brand-light'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-border bg-card p-6">
        {activeTab === 'identitas' && (
          <div className="space-y-4 max-w-2xl">
            <div className="text-sm font-semibold text-foreground">Identitas Varian</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Varian *</Label>
                <Input
                  id="name"
                  placeholder="Basic / Normal / Best Buy / Recommended"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="simple-upgrade-basic"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  URL: /produk/<span className="font-mono">{slug || '?'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier">Tier *</Label>
                <Select value={tier} onValueChange={handleTierChange}>
                  <SelectTrigger id="tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-sm font-semibold text-foreground mb-3">Ribbon / Badge</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ribbonLabel">Ribbon Label</Label>
                  <Input
                    id="ribbonLabel"
                    placeholder="BASIC / POPULAR / BEST BUY / RECOMMENDED"
                    value={ribbonLabel}
                    onChange={(e) => setRibbonLabel(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ribbonColor">Ribbon Color</Label>
                  <Select value={ribbonColor} onValueChange={setRibbonColor}>
                    <SelectTrigger id="ribbonColor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RIBBON_COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Ribbon preview */}
              <div className="mt-3 p-3 rounded-md bg-muted/50 flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Preview:</span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  ribbonColor === 'slate' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700' :
                  ribbonColor === 'blue' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                  ribbonColor === 'amber' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                  ribbonColor === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                  'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {ribbonLabel || 'BASIC'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-sm font-semibold text-foreground mb-3">Harga</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (display) *</Label>
                  <Input
                    id="price"
                    placeholder="Rp 3.500.000 atau Hubungi Admin"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="priceValue">Price Value (numeric, untuk sort)</Label>
                  <Input
                    id="priceValue"
                    type="number"
                    placeholder="3500000"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="priceNote">Price Note (disclaimer)</Label>
                <Input
                  id="priceNote"
                  placeholder="Harga non-diskon mengikuti harga yang tercantum pada brosur"
                  value={priceNote}
                  onChange={(e) => setPriceNote(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(val) => setIsActive(val === true)}
                />
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Active (tampil di carousel homepage & detail page)
                </Label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="space-y-4 max-w-3xl">
            <div className="text-sm font-semibold text-foreground">Konten Card (untuk carousel)</div>

            <div>
              <Label htmlFor="cardTitle">Card Title (konfigurasi)</Label>
              <Input
                id="cardTitle"
                placeholder='DSP + CONTROLLER + SUB 10"'
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Judul yang tampil di card carousel. Boleh beda dengan Nama Varian.
              </p>
            </div>

            <div>
              <Label htmlFor="cardDescription">Card Description (2-line summary)</Label>
              <Textarea
                id="cardDescription"
                placeholder="Paket lengkap dengan DSP Controller + Power Mono + Sub 10&quot; Prototype Quarto. Upgrade signifikan tanpa rombak total."
                value={cardDescription}
                onChange={(e) => setCardDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-muted-foreground">{cardDescription.length}/200 chars</p>
            </div>

            <div>
              <Label htmlFor="imageAlt">Main Image Alt Text</Label>
              <Input
                id="imageAlt"
                placeholder="Simple Upgrade Best Buy - Gambar utama"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>

            <div>
              <Label>Gallery Images (4+ untuk detail page carousel)</Label>
              <GalleryUpload
                images={galleryImages}
                onChange={setGalleryImages}
                productName={product.name}
                maxImages={6}
              />
            </div>

            {/* Card preview */}
            <div className="pt-4 border-t border-border">
              <div className="text-sm font-semibold text-foreground mb-3">Card Preview (homepage carousel)</div>
              <div className="rounded-xl border border-border bg-background overflow-hidden max-w-sm">
                <div className="relative w-full aspect-video bg-muted overflow-hidden">
                  {galleryImages[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={galleryImages[0]} alt={imageAlt || cardTitle} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-950">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">No image</span>
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    ribbonColor === 'slate' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700' :
                    ribbonColor === 'blue' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                    ribbonColor === 'amber' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                    ribbonColor === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {ribbonLabel || 'BASIC'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{product.name}</div>
                  <h3 className="mt-1 text-base font-bold leading-snug">{cardTitle || name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">{cardDescription}</p>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-base font-bold text-brand dark:text-brand-light">{price || 'Rp -'}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      {tier.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artikel' && (
          <div className="space-y-6">
            <div className="text-sm font-semibold text-foreground">Konten Artikel (untuk detail page)</div>

            <div className="max-w-2xl">
              <Label htmlFor="tagline">Tagline (branding)</Label>
              <Input
                id="tagline"
                placeholder="Innovation Car Audio Jakarta"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="introMarkdown">Intro Markdown (paragraf pembuka)</Label>
              <Textarea
                id="introMarkdown"
                placeholder={'Paket Best Buy dirancang untuk pengguna yang...\\n\\nPaket ini menggabungkan DSP Rainbow EL-PA4.6...'}
                value={introMarkdown}
                onChange={(e) => setIntroMarkdown(e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Pisahkan paragraf dengan baris kosong (double enter). Pakai **bold** untuk emphasis.
              </p>
            </div>

            <div>
              <SectionBuilder sections={sections} onChange={setSections} />
            </div>

            <div className="pt-4 border-t border-border space-y-4 max-w-2xl">
              <div className="text-sm font-semibold text-foreground">Closing Section</div>

              <div>
                <Label htmlFor="closingTagline">Closing Tagline</Label>
                <Input
                  id="closingTagline"
                  placeholder="BEST BUY. COMPLETE UPGRADE. ORIGINAL SPEAKER RETAINED."
                  value={closingTagline}
                  onChange={(e) => setClosingTagline(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="closingComponents">Closing Components (1 per line)</Label>
                <Textarea
                  id="closingComponents"
                  placeholder={'Rainbow DSP EL-PA4.6 + Controller\nPrototype Quarto Power Mono\nSubwoofer 10" Prototype Quarto'}
                  value={closingComponentsText}
                  onChange={(e) => setClosingComponentsText(e.target.value)}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <Label htmlFor="disclaimer">Disclaimer</Label>
                <Input
                  id="disclaimer"
                  placeholder="Harga non-diskon mengikuti harga yang tercantum pada brosur"
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4 max-w-2xl">
            <div className="text-sm font-semibold text-foreground">SEO Preview</div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Page Title
                </div>
                <div className="text-sm text-foreground truncate">{seoTitle}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{seoTitle.length} chars (target 50-60)</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Meta Description
                </div>
                <div className="text-sm text-foreground/80">{seoDescription}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{seoDescription.length}/160 chars</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Canonical URL
                </div>
                <div className="text-sm font-mono text-foreground">{seoUrl}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Keywords (auto-generated)
                </div>
                <div className="text-xs text-muted-foreground">{seoKeywords}</div>
              </div>
            </div>

            {/* Google SERP Preview */}
            <div className="pt-4 border-t border-border">
              <div className="text-sm font-semibold text-foreground mb-3">Google Search Result Preview</div>
              <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                <div className="text-xs text-green-700 truncate">https://peredammobiljakarta.com › produk › {slug}</div>
                <div className="text-lg text-blue-700 hover:underline cursor-pointer mt-0.5 truncate">
                  {seoTitle}
                </div>
                <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">{seoDescription}</div>
              </div>
            </div>

            {/* JSON-LD Preview */}
            <div className="pt-4 border-t border-border">
              <div className="text-sm font-semibold text-foreground mb-3">JSON-LD Structured Data</div>
              <pre className="rounded-md bg-slate-900 text-slate-100 p-4 text-xs overflow-x-auto font-mono">
{JSON.stringify({
  '@type': 'Product',
  name: `${product.name} ${name}`,
  description: seoDescription,
  image: galleryImages.slice(0, 4),
  brand: { '@type': 'Brand', name: 'Innovation Car Audio Jakarta' },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'IDR',
    price: priceValue || 0,
    availability: 'https://schema.org/InStock',
  },
}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link href={`/admin/products/${product.id}`}>
            <ArrowLeft className="size-4" />
            Batal
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {activeTab !== 'seo' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const order: Tab[] = ['identitas', 'card', 'artikel', 'seo']
                const nextIdx = order.indexOf(activeTab) + 1
                if (nextIdx < order.length) setActiveTab(order[nextIdx])
              }}
            >
              Next Tab →
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? 'Menyimpan…' : mode === 'create' ? 'Simpan Varian' : 'Update Varian'}
          </Button>
        </div>
      </div>
    </div>
  )
}
