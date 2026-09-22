import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { ProductForm, type InitialProductData } from '@/components/admin/products/product-form'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Produk — Admin Peredam Mobil Jakarta',
  description: 'Edit produk yang sudah ada.',
  robots: { index: false, follow: false },
}

interface ProductRow {
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
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  let product: ProductRow | null = null
  try {
    product = (await db.product.findUnique({
      where: { id },
    } as never)) as ProductRow | null
  } catch (err) {
    console.error('[edit-product] fetch error:', err)
  }

  if (!product) notFound()

  const initial: InitialProductData = {
    id: product.id,
    name: product.name ?? '',
    slug: product.slug ?? '',
    category: product.category ?? 'Paket Upgrade Audio',
    shortDescription: product.shortDescription ?? null,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt ?? null,
    waNumber: product.waNumber ?? '6282211222399',
    sortOrder: product.sortOrder ?? 1,
    isActive: product.isActive ?? true,
  }

  return (
    <>
      <ProductForm initial={initial} />
      <SonnerToaster richColors position="top-right" />
    </>
  )
}
