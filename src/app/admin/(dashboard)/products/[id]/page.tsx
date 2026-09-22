import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ProductVariantsManager } from '@/components/admin/products/product-variants-manager'
import { ArrowLeft, Pencil, ExternalLink, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface ProductDetail {
  id: string
  name: string
  slug: string
  category: string
  shortDescription: string | null
  imageUrl: string | null
  imageAlt: string | null
  waNumber: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

async function getProductById(id: string): Promise<ProductDetail | null> {
  try {
    const product = (await db.product.findFirst({
      where: { id },
    } as never)) as ProductDetail | null
    return product
  } catch (err) {
    console.error('[admin/products/[id]] fetch error:', err)
    return null
  }
}

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Semua Produk
        </Link>

        {/* Product header card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image */}
            <div className="shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-muted border border-border">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.imageAlt || product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-950">
                  <Package className="size-8 text-amber-700 dark:text-amber-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Kategori</dt>
                  <dd className="mt-0.5 font-medium">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Slug</dt>
                  <dd className="mt-0.5 font-medium text-muted-foreground truncate">/produk/{product.slug}-*</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Sort Order</dt>
                  <dd className="mt-0.5 font-medium">{product.sortOrder}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
                  <dd className="mt-0.5">
                    {product.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {product.shortDescription && (
                <p className="mt-3 text-sm text-muted-foreground">{product.shortDescription}</p>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="default">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Pencil className="size-4" />
                    Edit Produk
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`/#paket`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Lihat di Homepage
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Variants section */}
        <ProductVariantsManager productId={product.id} productName={product.name} productSlug={product.slug} />
      </div>
    </div>
  )
}
