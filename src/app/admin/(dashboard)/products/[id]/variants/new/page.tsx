import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { VariantForm } from '@/components/admin/products/variant-form'

export const dynamic = 'force-dynamic'

interface ProductOption {
  id: string
  name: string
  slug: string
  category: string
}

async function getProductById(id: string): Promise<ProductOption | null> {
  try {
    const product = (await db.product.findFirst({
      where: { id },
      select: { id: true, name: true, slug: true, category: true },
    } as never)) as ProductOption | null
    return product
  } catch (err) {
    console.error('[admin/products/[id]/variants/new] fetch error:', err)
    return null
  }
}

export default async function AdminNewVariantForProductPage({
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
      <VariantForm mode="create" product={product} initial={null} />
    </div>
  )
}
