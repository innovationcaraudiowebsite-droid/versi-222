'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface GalleryUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  productName?: string
  maxImages?: number
}

/**
 * GalleryUpload — multi-image upload component.
 *
 * MOCK MODE: Karena Supabase belum connect, upload file belum berfungsi.
 * User bisa pakai "Add via URL" sebagai gantinya.
 *
 * Saat Supabase sudah connect nanti, ini akan otomatis upload ke Storage:
 *  - POST /api/admin/upload-gallery (multipart/form-data)
 *  - Auto-resize via sharp (max 1200x1200, webp)
 *  - Return array of public URLs
 */
export function GalleryUpload({ images, onChange, productName, maxImages = 6 }: GalleryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      // === MOCK MODE ===
      // Supabase belum connect — gunakan object URL sebagai placeholder.
      // Setelah Supabase connect, ganti dengan POST ke /api/admin/upload-gallery.
      toast.info('Mock mode: upload file belum didukung. Gunakan "Add via URL"')

      // Untuk demo: konversi file ke object URL (temporary)
      const newImages: string[] = []
      const remaining = maxImages - images.length
      const toAdd = Array.from(files).slice(0, remaining)
      for (const f of toAdd) {
        newImages.push(URL.createObjectURL(f))
      }
      onChange([...images, ...newImages])
    } catch (err) {
      toast.error('Gagal upload gambar')
      console.error('[gallery-upload] error:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url) return
    if (images.length >= maxImages) {
      toast.error(`Maksimal ${maxImages} gambar`)
      return
    }
    onChange([...images, url])
    setUrlInput('')
  }

  function removeImage(idx: number) {
    const next = [...images]
    next.splice(idx, 1)
    onChange(next)
  }

  function moveImage(idx: number, dir: 'left' | 'right') {
    const target = dir === 'left' ? idx - 1 : idx + 1
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">Gallery Images</div>
          <div className="text-xs text-muted-foreground">
            {images.length} / {maxImages} gambar
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading || images.length >= maxImages}
        />
      </div>

      {/* Mock mode notice */}
      <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
        ⚠️ <strong>Mock Mode:</strong> Upload file belum didukung. Gunakan &quot;Add via URL&quot; di bawah.
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
          disabled={!urlInput.trim() || images.length >= maxImages}
        >
          <Plus className="size-4" />
          Add URL
        </Button>
      </div>

      {/* Preview grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted"
            >
              <Image
                src={img}
                alt={`${productName || 'Gallery'} ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
                unoptimized
              />
              {/* Top-right actions */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveImage(idx, 'left')}
                  disabled={idx === 0}
                  className="rounded bg-black/60 hover:bg-black/80 text-white p-1 text-xs disabled:opacity-30"
                  aria-label="Geser kiri"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(idx, 'right')}
                  disabled={idx === images.length - 1}
                  className="rounded bg-black/60 hover:bg-black/80 text-white p-1 text-xs disabled:opacity-30"
                  aria-label="Geser kanan"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="rounded bg-red-600 hover:bg-red-700 text-white p-1"
                  aria-label="Hapus"
                >
                  <X className="size-3" />
                </button>
              </div>
              {/* Index badge */}
              <div className="absolute bottom-1 left-1 rounded bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Belum ada gambar. Upload atau tambah URL.
        </div>
      )}
    </div>
  )
}
