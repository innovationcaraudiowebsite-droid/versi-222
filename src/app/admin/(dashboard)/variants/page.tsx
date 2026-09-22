import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { VariantsTable } from '@/components/admin/products/variants-table'

export const dynamic = 'force-dynamic'

interface VariantRow {
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

async function getAllVariants(): Promise<VariantRow[]> {
  try {
    const products = (await db.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, category: true },
    } as never)) as Array<{ id: string; name: string; slug: string; category: string }>

    const productMap = new Map(products.map((p) => [p.id, p]))

    const variants = (await db.productVariant.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    } as never)) as Array<Omit<VariantRow, 'parentName' | 'parentSlug' | 'category'>>

    return variants
      .filter((v) => productMap.has(v.productId))
      .map((v) => {
        const parent = productMap.get(v.productId)!
        return {
          ...v,
          parentName: parent.name,
          parentSlug: parent.slug,
          category: parent.category,
        }
      })
  } catch (err) {
    console.error('[admin/variants] fetch error:', err)
    return []
  }
}

export default async function AdminVariantsPage() {
  const variants = await getAllVariants()

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Varian Produk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola semua varian produk (Basic, Normal, Best Buy, Recommended). Total {variants.length} varian dari {new Set(variants.map((v) => v.productId)).size} produk.
          </p>
        </div>

        <VariantsTable variants={variants} />
      </div>
    </div>
  )
}
