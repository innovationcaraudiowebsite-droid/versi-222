'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Save, Upload, X, Package, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * ProductForm — form untuk create/edit Product parent.
 *
 * Field (sesuai schema Product type):
 *  - name *           : "Simple Upgrade"
 *  - slug *           : "simple-upgrade" (auto-generate dari name)
 *  - category *       : dropdown (Paket Upgrade Audio, Paket Peredam, Paket Service, Material, Aksesori, Audio, Lainnya)
 *  - shortDescription : 1-line summary (max 120 char) untuk card fallback
 *  - imageUrl         : gambar fallback (kalau variant tidak punya imageUrl)
 *  - imageAlt         : alt text untuk image
 *  - waNumber *       : nomor WA (default 6282211222399)
 *  - sortOrder *      : urutan tampil (default: max+1 dari DB)
 *  - isActive         : checkbox (default true)
 *
 * Layout: Form di kiri + preview card live di kanan (update real-time).
 */

export interface InitialProductData {
  id?: string
  name: string
  slug: string
  category: string
  shortDescription: string | null
  imageUrl: string | null
  imageAlt: string | null
  waNumber: string
  sortOrder: number
  isActive: boolean
}

interface ProductFormProps {
  initial: InitialProductData | null
  nextSortOrder?: number // hint untuk default sort order (max+1 dari DB)
}

// Kategori options — gabungan dari yang lama + yang dipakai di mock data
const CATEGORY_OPTIONS = [
  'Paket Upgrade Audio',
  'Paket Peredam',
  'Paket Service',
  'Material',
  'Aksesori',
  'Audio',
  'Lainnya',
]

const DEFAULT_WA = '6282211222399'

// ============================================================
// Helper: slugify
// ============================================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // hapus karakter non-alphanumeric
    .replace(/\s+/g, '-') // spasi → dash
    .replace(/-+/g, '-') // multiple dash → single dash
    .replace(/^-|-$/g, '') // trim dash di awal/akhir
}

export function ProductForm({ initial, nextSortOrder = 1 }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Slug manual edit tracking — kalau user edit slug sendiri, jangan auto-generate
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initial?.slug)

  const [form, setForm] = useState<InitialProductData>(
    initial ?? {
      name: '',
      slug: '',
      category: 'Paket Upgrade Audio',
      shortDescription: '',
      imageUrl: null,
      imageAlt: '',
      waNumber: DEFAULT_WA,
      sortOrder: nextSortOrder,
      isActive: true,
    },
  )

  const patch = (p: Partial<InitialProductData>) => setForm((prev) => ({ ...prev, ...p }))

  // Handle name change — auto-generate slug (unless user edited slug manually)
  function handleNameChange(name: string) {
    patch({ name })
    if (!slugManuallyEdited) {
      patch({ slug: slugify(name) })
    }
  }

  function handleSlugChange(slug: string) {
    setSlugManuallyEdited(true)
    patch({ slug: slugify(slug) })
  }

  // Image upload (mock mode: URL paste only)
  const [urlInput, setUrlInput] = useState('')

  async function handleFileUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-product', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Gagal upload gambar')
      }
      const data = (await res.json()) as { ok: boolean; url?: string; mock?: boolean }
      if (!data.url) throw new Error('URL gambar tidak diterima')
      patch({ imageUrl: data.url })
      if (data.mock) {
        toast.info('Mock mode: upload file belum didukung. Disarankan pakai "Add via URL".')
      } else {
        toast.success('Gambar berhasil diupload')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal upload gambar')
    } finally {
      setUploading(false)
    }
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url) return
    patch({ imageUrl: url })
    setUrlInput('')
    toast.success('URL gambar ditambahkan')
  }

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 3) {
      errs.name = 'Nama produk wajib diisi (min 3 karakter)'
    }
    if (!form.slug.trim()) {
      errs.slug = 'Slug wajib diisi'
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errs.slug = 'Slug hanya boleh huruf kecil, angka, dan dash'
    }
    if (!form.waNumber.trim() || form.waNumber.length < 8) {
      errs.waNumber = 'Nomor WA wajib diisi (min 8 digit, format 62xxx)'
    }
    if (form.shortDescription && form.shortDescription.length > 120) {
      errs.shortDescription = 'Short description max 120 karakter'
    }
    return errs
  }, [form])

  const isValid = Object.keys(errors).length === 0

  // Save
  async function handleSave() {
    if (!isValid) {
      toast.error('Periksa kembali field yang belum benar')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category,
        shortDescription: form.shortDescription?.trim() || null,
        imageUrl: form.imageUrl,
        imageAlt: form.imageAlt?.trim() || null,
        waNumber: form.waNumber.trim(),
        sortOrder: Number(form.sortOrder) || 1,
        isActive: form.isActive,
      }

      const isEdit = !!initial?.id
      const url = isEdit
        ? `/api/admin/products/${initial!.id}`
        : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Gagal menyimpan produk')
      }

      toast.success(isEdit ? 'Produk berhasil diupdate' : 'Produk baru berhasil dibuat')

      // Redirect ke detail produk (untuk lanjut tambah varian)
      const productId = isEdit ? initial!.id : (data.product?.id || data.id)
      if (productId) {
        router.push(`/admin/products/${productId}`)
      } else {
        router.push('/admin/products')
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan produk')
      console.error('[product-form] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Semua Produk
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {initial?.id ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat produk induk. Setelah disimpan, Anda bisa menambahkan varian (Basic/Normal/Best Buy/Recommended) untuk produk ini.
        </p>
      </div>

      {/* 2-column layout: Form (kiri) + Preview (kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        {/* === FORM === */}
        <div className="space-y-6">
          {/* Section: Identitas */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="text-sm font-semibold text-foreground">Identitas Produk</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Nama Produk <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Simple Upgrade"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  maxLength={80}
                />
                {errors.name ? (
                  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.name}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">{form.name.length}/80 karakter</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-1">
                  <Input
                    id="slug"
                    placeholder="simple-upgrade"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSlugManuallyEdited(false)
                      patch({ slug: slugify(form.name) })
                    }}
                    title="Auto-generate dari nama"
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
                {errors.slug ? (
                  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.slug}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    URL: /produk/<span className="font-mono">{form.slug || '?'}</span>-*
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="category">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => patch({ category: val })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                placeholder="1-line summary untuk card fallback (max 120 char)"
                value={form.shortDescription ?? ''}
                onChange={(e) => patch({ shortDescription: e.target.value })}
                rows={2}
                maxLength={120}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {(form.shortDescription ?? '').length}/120 karakter — dipakai untuk card fallback di carousel kalau variant tidak punya cardDescription
              </p>
            </div>
          </div>

          {/* Section: Gambar Fallback */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <div className="text-sm font-semibold text-foreground">Gambar Fallback</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gambar utama parent. Dipakai HANYA kalau variant tidak punya imageUrl.
              </p>
            </div>

            {/* Current image preview */}
            {form.imageUrl && (
              <div className="relative h-40 w-full rounded-md overflow-hidden border border-border bg-muted">
                <Image
                  src={form.imageUrl}
                  alt={form.imageAlt || form.name || 'Product image'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => patch({ imageUrl: null })}
                  className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-black/80 text-white p-1.5"
                  aria-label="Hapus gambar"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Upload buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileUpload(f)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              />
            </div>

            {/* Mock mode notice */}
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              ⚠️ <strong>Mock Mode:</strong> Upload file belum didukung (butuh Supabase Storage). Gunakan &quot;Add via URL&quot; di bawah.
            </div>

            {/* URL input */}
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://images.unsplash.com/photo-... (paste URL gambar)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addUrl()
                  }
                }}
              />
              <Button
                type="button"
                onClick={addUrl}
                disabled={!urlInput.trim()}
              >
                Add URL
              </Button>
            </div>

            {/* Image Alt */}
            <div>
              <Label htmlFor="imageAlt">Image Alt Text</Label>
              <Input
                id="imageAlt"
                placeholder="Simple Upgrade - gambar utama"
                value={form.imageAlt ?? ''}
                onChange={(e) => patch({ imageAlt: e.target.value })}
                maxLength={100}
              />
              <p className="mt-1 text-xs text-muted-foreground">Untuk a11y (accessibility) + SEO image search</p>
            </div>
          </div>

          {/* Section: Kontak & Urutan */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="text-sm font-semibold text-foreground">Kontak & Urutan</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="waNumber">
                  Nomor WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="waNumber"
                  placeholder="6282211222399"
                  value={form.waNumber}
                  onChange={(e) => patch({ waNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  maxLength={15}
                />
                {errors.waNumber ? (
                  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.waNumber}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Format: 62xxx (tanpa tanda + atau spasi)</p>
                )}
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="1"
                  value={form.sortOrder}
                  onChange={(e) => patch({ sortOrder: Number(e.target.value) })}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Urutan tampil di carousel (ASC). 1 = paling awal
                </p>
              </div>
            </div>
          </div>

          {/* Section: Status */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(val) => patch({ isActive: val === true })}
              />
              <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Aktif (produk tampil di carousel homepage)
              </Label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground ml-7">
              Produk yang tidak aktif tidak akan tampil di carousel, tapi varian yang sudah ada tetap bisa diakses via detail page.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="ghost">
              <Link href="/admin/products">
                <ArrowLeft className="size-4" />
                Batal
              </Link>
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !isValid}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? 'Menyimpan…' : (initial?.id ? 'Update Produk' : 'Simpan Produk')}
            </Button>
          </div>
        </div>

        {/* === PREVIEW (kanan, sticky di desktop) === */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
              Preview Card (Carousel)
            </div>

            {/* Card preview — mirror of products-list.tsx card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt={form.imageAlt || form.name || 'Product'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-950">
                    <Package className="size-10 text-amber-700 dark:text-amber-300" />
                  </div>
                )}
                {/* Ribbon placeholder (kosong karena produk parent tidak punya ribbon) */}
              </div>

              <div className="p-4">
                {/* Parent name (small uppercase) */}
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                  {form.category || 'Kategori'}
                </div>

                {/* Card title (nama produk) */}
                <h3 className="mt-1 text-sm sm:text-base font-bold leading-snug line-clamp-2">
                  {form.name || 'Nama Produk'}
                </h3>

                {/* Short description */}
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {form.shortDescription || 'Short description akan tampil di sini...'}
                </p>

                {/* Footer: variant count placeholder + tier */}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Belum ada varian
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    no variant
                  </span>
                </div>
              </div>
            </div>

            {/* URL preview */}
            <div className="mt-3 text-xs text-muted-foreground">
              <div className="font-semibold mb-1">URL Struktur:</div>
              <div className="font-mono text-[10px] break-all">
                /produk/<span className="text-foreground">{form.slug || '?'}</span>-basic<br />
                /produk/<span className="text-foreground">{form.slug || '?'}</span>-normal<br />
                /produk/<span className="text-foreground">{form.slug || '?'}</span>-best-buy<br />
                /produk/<span className="text-foreground">{form.slug || '?'}</span>-recommended
              </div>
            </div>

            {/* WA preview */}
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="font-semibold mb-1">WhatsApp CTA:</div>
              <div className="font-mono text-[10px]">wa.me/{form.waNumber || '?'}</div>
            </div>
          </div>

          {/* Validation status */}
          {!isValid && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3 text-xs">
              <div className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                ⚠️ Form belum lengkap:
              </div>
              <ul className="space-y-0.5 text-amber-700 dark:text-amber-400">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
