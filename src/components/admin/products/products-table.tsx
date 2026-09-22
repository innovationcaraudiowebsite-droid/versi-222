'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Search, Eye, Layers } from 'lucide-react'
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

interface Product {
  id: string
  name: string
  slug: string
  category: string
  shortDescription: string | null
  imageUrl: string | null
  waNumber: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  variantCount?: number
}

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categories = Array.from(new Set(products.map((p) => p.category))).sort()

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'all' || p.category === filterCategory
    return matchSearch && matchCategory
  })

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Gagal menghapus produk')
      }
      toast.success('Produk berhasil dihapus')
      setDeleteId(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus produk')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter & search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Produk</th>
              <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Kategori</th>
              <th className="px-4 py-3 text-center font-semibold">Varian</th>
              <th className="px-4 py-3 text-center font-semibold hidden md:table-cell">Sort</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  {products.length === 0 ? 'Belum ada produk.' : 'Tidak ada produk yang cocok dengan filter.'}
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
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
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium text-foreground hover:text-brand dark:hover:text-brand-light transition-colors"
                        >
                          {p.name}
                        </Link>
                        <div className="text-xs text-muted-foreground truncate">/produk/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                    >
                      <Layers className="size-3" />
                      {p.variantCount ?? 0}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell text-muted-foreground">{p.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    {p.isActive ? (
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
                        <Link href={`/admin/products/${p.id}`} aria-label="Lihat detail & varian">
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                        <Link href={`/admin/products/${p.id}/edit`} aria-label="Edit produk">
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <AlertDialog open={deleteId === p.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" aria-label="Hapus produk">
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus produk &quot;{p.name}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak bisa dibatalkan. Produk dan semua varian terkait akan dihapus permanen.
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground text-right">
        Total: {filtered.length} dari {products.length} produk
      </div>
    </div>
  )
}
