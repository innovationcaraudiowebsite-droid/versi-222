'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductOption {
  id: string
  name: string
  slug: string
  category: string
}

interface VariantFormPickerProps {
  products: ProductOption[]
}

export function VariantFormPicker({ products }: VariantFormPickerProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/variants"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Varian
        </Link>

        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Package className="size-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">Belum ada produk aktif</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan produk induk terlebih dahulu sebelum membuat varian.
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/products/new">Tambah Produk</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/variants"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Varian
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Varian Baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih produk induk untuk varian baru. Setiap varian akan terikat ke satu produk.
        </p>
      </div>

      {/* Step 1: Pick product */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
          Step 1: Pilih Produk Induk
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`text-left rounded-lg border p-3 transition-all ${
                selectedId === p.id
                  ? 'border-brand ring-2 ring-brand/30 bg-brand/5'
                  : 'border-border hover:border-brand/40 hover:bg-muted/30'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {p.category}
              </div>
              <div className="mt-1 font-semibold text-foreground">{p.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">/produk/{p.slug}-*</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Continue */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
          Step 2: Lanjut ke Form Varian
        </div>
        <Button
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) {
              router.push(`/admin/products/${selectedId}/variants/new`)
            }
          }}
        >
          Lanjut ke Form Varian
          <ChevronRight className="size-4" />
        </Button>
        {!selectedId && (
          <p className="mt-2 text-xs text-muted-foreground">
            Pilih produk di atas terlebih dahulu untuk mengaktifkan tombol ini.
          </p>
        )}
      </div>
    </div>
  )
}
