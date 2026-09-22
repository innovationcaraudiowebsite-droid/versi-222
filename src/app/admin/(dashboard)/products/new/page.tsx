import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ProductForm } from '@/components/admin/products/product-form'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Tambah Produk — Admin Peredam Mobil Jakarta',
  description: 'Tambah produk baru untuk landing page.',
  robots: { index: false, follow: false },
}

/**
 * Hint next sort order = max+1 dari existing products.
 */
async function getNextSortOrder(): Promise<number> {
  try {
    const products = (await db.product.findMany({
      select: { sortOrder: true },
      orderBy: { sortOrder: 'desc' },
      take: 1,
    } as never)) as Array<{ sortOrder: number }>
    if (products.length === 0) return 1
    return (products[0].sortOrder || 0) + 1
  } catch {
    return 1
  }
}

export default async function NewProductPage() {
  await requireAdmin()
  const nextSortOrder = await getNextSortOrder()

  return (
    <>
      <ProductForm initial={null} nextSortOrder={nextSortOrder} />
      <SonnerToaster richColors position="top-right" />
    </>
  )
}
