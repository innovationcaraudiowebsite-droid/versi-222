'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Search, Eye, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

// Ribbon color classes (mirror dari products-list.tsx)
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
  priceValue: number | null
  ribbonLabel: string | null
  ribbonColor: string | null
  cardTitle: string | null
  imageUrl: string | null
  imageAlt: string | null
  isActive: boolean
  parentName?: string
  parentSlug?: string
  category?: string
}

interface VariantsTableProps {
  variants: Variant[]
}

export function VariantsTable({ variants }: VariantsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterParent, setFilterParent] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const tiers = ['basic', 'normal', 'best_buy', 'recommended']
  const parents = Array.from(new Set(variants.map((v) => v.parentName).filter(Boolean))) as string[]

  const filtered = variants.filter((v) => {
    const matchSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.slug.toLowerCase().includes(search.toLowerCase()) ||
      (v.cardTitle || '').toLowerCase().includes(search.toLowerCase())
    const matchTier = filterTier === 'all' || v.tier === filterTier
    const matchParent = filterParent === 'all' || v.parentName === filterParent
    return matchSearch && matchTier && matchParent
  })

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      // Find the variant to get productId
      const variant = variants.find((v) => v.id === deleteId)
      if (!variant) throw new Error('Variant tidak ditemukan')
      const res = await fetch(`/api/admin/products/${variant.productId}/variants/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Gagal menghapus varian')
      }
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
    <div className="space-y-4">
      {/* Filter & search */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari varian… (nama, slug, card title)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterParent}
          onChange={(e) => setFilterParent(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Semua Produk</option>
          {parents.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Semua Tier</option>
          {tiers.map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ')}
            </option>
          ))}
        </select>
        <Button asChild>
          <Link href="/admin/variants/new">
            <Plus className="h-4 w-4" />
            Tambah Varian
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Varian</th>
              <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Produk Parent</th>
              <th className="px-4 py-3 text-center font-semibold">Tier / Ribbon</th>
              <th className="px-4 py-3 text-left font-semibold">Harga</th>
              <th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">Sort</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  {variants.length === 0 ? 'Belum ada varian.' : 'Tidak ada varian yang cocok dengan filter.'}
                </td>
              </tr>
            ) : (
              filtered.map((v, idx) => {
                const ribbonClass = RIBBON_STYLES[v.ribbonColor || 'slate'] || RIBBON_STYLES.slate
                return (
                  <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                          {v.imageUrl ? (
                            <Image
                              src={v.imageUrl}
                              alt={v.imageAlt || v.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full grid place-items-center bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-950">
                              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300">IMG</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{v.name}</div>
                          <div className="text-xs text-muted-foreground truncate">/produk/{v.slug}</div>
                          {v.cardTitle && (
                            <div className="text-xs text-foreground/70 truncate max-w-[300px]">{v.cardTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {v.parentName ? (
                        <Link
                          href={`/admin/products/${v.productId}`}
                          className="text-foreground hover:text-brand dark:hover:text-brand-light transition-colors"
                        >
                          {v.parentName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.ribbonLabel && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ribbonClass}`}>
                          {v.ribbonLabel}
                        </span>
                      )}
                      <div className="mt-1 text-[10px] text-muted-foreground capitalize">{v.tier.replace('_', ' ')}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{v.price}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">{v.sortOrder}</td>
                    <td className="px-4 py-3 text-center">
                      {v.isActive ? (
                        <Badge variant="default" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <a
                            href={`/produk/${v.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Lihat di homepage"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <Link
                            href={`/admin/products/${v.productId}/variants/${v.id}/edit`}
                            aria-label="Edit varian"
                          >
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
                                Tindakan ini tidak bisa dibatalkan. Varian akan dihapus permanen dari database.
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
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground text-right">
        Total: {filtered.length} dari {variants.length} varian
      </div>
    </div>
  )
}
