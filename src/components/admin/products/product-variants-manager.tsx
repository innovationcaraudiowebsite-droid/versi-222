'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ExternalLink, RefreshCw, Power, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const RIBBON_STYLES: Record<string, string> = {
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700',
  blue: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  amber: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
}

interface Variant {
  id: string
  productId: string
  name: string
  slug: string
  tier: string
  sortOrder: number
  price: string
  ribbonLabel: string | null
  ribbonColor: string | null
  cardTitle: string | null
  imageUrl: string | null
  imageAlt: string | null
  isActive: boolean
}

interface ProductVariantsManagerProps {
  productId: string
  productName: string
  productSlug: string
}

export function ProductVariantsManager({ productId, productName, productSlug }: ProductVariantsManagerProps) {
  const router = useRouter()
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchVariants() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/products/${productId}/variants`)
        const data = await res.json()
        if (!cancelled) {
          setVariants(data.variants || [])
        }
      } catch (err) {
        console.error('[variants-manager] fetch error:', err)
        if (!cancelled) setVariants([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchVariants()
    return () => {
      cancelled = true
    }
  }, [productId])

  async function handleBulkAction() {
    if (!bulkAction) return
    setBulkLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: bulkAction }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Gagal bulk update')
      toast.success(`Semua varian ${bulkAction === 'activate' ? 'diaktifkan' : 'dinonaktifkan'}`)
      setBulkAction(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal bulk update')
    } finally {
      setBulkLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Gagal menghapus varian')
      toast.success('Varian berhasil dihapus')
      setDeleteId(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus varian')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Varian ({variants.length})</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Kelola varian untuk produk &quot;{productName}&quot;
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/admin/products/${productId}/variants/new`}>
            <Plus className="size-4" />
            Tambah Varian
          </Link>
        </Button>
      </div>

      {/* Bulk actions */}
      {variants.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">Bulk action:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkAction('activate')}
            disabled={bulkLoading}
          >
            <Power className="size-3.5" />
            Activate All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkAction('deactivate')}
            disabled={bulkLoading}
          >
            <Power className="size-3.5" />
            Deactivate All
          </Button>
          <Button size="sm" variant="ghost" disabled title="Coming soon">
            <ArrowUpDown className="size-3.5" />
            Reorder
          </Button>
          {bulkLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Variants list */}
      <div className="p-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <RefreshCw className="size-5 animate-spin mx-auto mb-2" />
            Memuat varian…
          </div>
        ) : variants.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Belum ada varian.{' '}
            <Link
              href={`/admin/products/${productId}/variants/new`}
              className="text-brand dark:text-brand-light hover:underline font-medium"
            >
              Tambah varian pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {variants.map((v, idx) => {
              const ribbonClass = RIBBON_STYLES[v.ribbonColor || 'slate'] || RIBBON_STYLES.slate
              return (
                <div
                  key={v.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-brand/40 hover:bg-muted/30 transition-colors"
                >
                  <div className="text-sm text-muted-foreground w-6 shrink-0">{idx + 1}.</div>

                  <div className="h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                    {v.imageUrl ? (
                      <Image
                        src={v.imageUrl}
                        alt={v.imageAlt || v.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-950">
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300">IMG</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{v.name}</span>
                      {v.ribbonLabel && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ribbonClass}`}>
                          {v.ribbonLabel}
                        </span>
                      )}
                    </div>
                    {v.cardTitle && (
                      <div className="text-xs text-muted-foreground truncate">{v.cardTitle}</div>
                    )}
                    <div className="text-xs text-muted-foreground truncate">/produk/{v.slug}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-semibold text-foreground text-sm">{v.price}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{v.tier.replace('_', ' ')}</div>
                  </div>

                  <div className="shrink-0">
                    {v.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                      <a href={`/produk/${v.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Lihat di homepage">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                      <Link href={`/admin/products/${productId}/variants/${v.id}/edit`} aria-label="Edit varian">
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <AlertDialog open={deleteId === v.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" aria-label="Hapus varian">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus varian &quot;{v.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak bisa dibatalkan. Varian akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleting ? 'Menghapus…' : 'Hapus'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bulk action confirmation */}
      <AlertDialog open={bulkAction !== null} onOpenChange={(open) => !open && setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'activate' ? 'Activate' : 'Deactivate'} semua varian?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'activate'
                ? 'Semua varian akan ditampilkan di carousel homepage.'
                : 'Semua varian akan disembunyikan dari carousel homepage.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkAction} disabled={bulkLoading}>
              {bulkLoading ? 'Memproses…' : 'Konfirmasi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview links */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Preview di Homepage
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <a
            href={`/#paket`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand dark:text-brand-light hover:underline"
          >
            <ExternalLink className="size-3" />
            Carousel Homepage (/#paket)
          </a>
          <span className="text-muted-foreground">·</span>
          {variants.length > 0 && (
            <a
              href={`/produk/${variants[0].slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brand dark:text-brand-light hover:underline"
            >
              <ExternalLink className="size-3" />
              Detail page: /produk/{variants[0].slug}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
