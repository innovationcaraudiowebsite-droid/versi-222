import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { VariantFormPicker } from '@/components/admin/products/variant-form-picker'

export const dynamic = 'force-dynamic'

interface ProductOption {
  id: string
  name: string
  slug: string
  category: string
}

async function getActiveProducts(): Promise<ProductOption[]> {
  try {
    return (await db.product.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, category: true },
    } as never)) as ProductOption[]
  } catch (err) {
    console.error('[admin/variants/new] fetch error:', err)
    return []
  }
}

export default async function AdminNewVariantPage() {
  const products = await getActiveProducts()

  return (
    <div className="space-y-6">
      <VariantFormPicker products={products} />
    </div>
  )
}
