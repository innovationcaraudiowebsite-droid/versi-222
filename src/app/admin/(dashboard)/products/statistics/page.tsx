import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { StatisticsView } from '@/components/admin/products/statistics-view'

export const dynamic = 'force-dynamic'

interface ProductRow {
  id: string
  name: string
  slug: string
  category: string
  isActive: boolean
}

interface VariantRow {
  id: string
  productId: string
  name: string
  tier: string
  price: string
  priceValue: number | null
  isActive: boolean
  ribbonLabel: string | null
  ribbonColor: string | null
  galleryImages: string[]
  cardTitle: string | null
}

async function getStats() {
  try {
    const [products, variants] = await Promise.all([
      db.product.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, category: true, isActive: true },
      } as never),
      db.productVariant.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true, productId: true, name: true, tier: true,
          price: true, priceValue: true, isActive: true,
          ribbonLabel: true, ribbonColor: true,
          galleryImages: true, cardTitle: true,
        },
      } as never),
    ])

    return {
      products: products as ProductRow[],
      variants: variants as VariantRow[],
    }
  } catch (err) {
    console.error('[admin/products/statistics] fetch error:', err)
    return { products: [], variants: [] }
  }
}

export default async function AdminProductStatisticsPage() {
  const { products, variants } = await getStats()

  return (
    <div className="space-y-6">
      <StatisticsView products={products} variants={variants} />
    </div>
  )
}
