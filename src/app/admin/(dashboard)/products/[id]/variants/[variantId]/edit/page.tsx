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

interface VariantInitial {
  id: string
  name: string
  slug: string
  tier: string
  sortOrder: number
  price: string
  priceValue: number | null
  priceNote: string | null
  ribbonLabel: string | null
  ribbonColor: string | null
  cardTitle: string | null
  cardDescription: string | null
  imageUrl: string | null
  imageAlt: string | null
  galleryImages: string[]
  tagline: string | null
  introMarkdown: string | null
  sections: Array<{
    title: string
    type: 'markdown' | 'list' | 'subsections'
    markdown?: string
    items?: string[]
    subsections?: Array<{ title: string; subtitle?: string | null; markdown: string }>
  }> | null
  closingTagline: string | null
  closingComponents: string[] | null
  disclaimer: string | null
  isActive: boolean
}

async function getProductById(id: string): Promise<ProductOption | null> {
  try {
    return (await db.product.findFirst({
      where: { id },
      select: { id: true, name: true, slug: true, category: true },
    } as never)) as ProductOption | null
  } catch (err) {
    console.error('[admin/variants/edit] fetch product error:', err)
    return null
  }
}

async function getVariantById(productId: string, variantId: string): Promise<VariantInitial | null> {
  try {
    return (await db.productVariant.findFirst({
      where: { id: variantId, productId },
    } as never)) as VariantInitial | null
  } catch (err) {
    console.error('[admin/variants/edit] fetch variant error:', err)
    return null
  }
}

export default async function AdminEditVariantPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>
}) {
  const { id, variantId } = await params
  const [product, variant] = await Promise.all([
    getProductById(id),
    getVariantById(id, variantId),
  ])

  if (!product || !variant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <VariantForm mode="edit" product={product} initial={variant} />
    </div>
  )
}
