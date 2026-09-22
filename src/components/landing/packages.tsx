import { db } from '@/lib/db'
import { ProductsList, type ProductVariantItem } from '@/components/landing/products-list'

/**
 * Paket Layanan section — section id="paket".
 *
 * CAROUSEL MODE — 1 card per ProductVariant (15 card untuk 5 produk × 3 varian).
 *
 * Flow:
 *  1. Fetch semua Product parent (isActive=true, urut by sortOrder ASC)
 *  2. Fetch semua ProductVariant (isActive=true, urut by sortOrder ASC)
 *  3. Join variant → parent (untuk dapat parentName, waNumber)
 *  4. Pass ke <ProductsList> client component untuk render carousel
 *
 * Card menampilkan:
 *  - Ribbon/badge sesuai tier (BASIC/POPULAR/BEST BUY/RECOMMENDED)
 *  - Mini image carousel (4+ gallery images per varian)
 *  - Card title (konfigurasi)
 *  - Card description (2-line)
 *  - Price + tier label
 *
 * Tier distribution:
 *  - basic       → ribbon "BASIC"      (slate)
 *  - normal      → ribbon "POPULAR"    (blue)
 *  - best_buy    → ribbon "BEST BUY"   (amber)
 *  - recommended → ribbon "RECOMMENDED" (emerald)
 */

export const dynamic = 'force-dynamic'

const MAX_VARIANTS = 60 // limit supaya tidak berat (kalau DB punya ratusan)

type ProductRow = {
  id: string
  name: string
  slug: string
  category: string
  waNumber: string
  sortOrder: number
}

async function getActiveVariants(): Promise<ProductVariantItem[]> {
  try {
    // Fetch parent products (map by id untuk join)
    const products = (await db.product.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        waNumber: true,
        sortOrder: true,
      },
    } as never)) as ProductRow[]

    const productMap = new Map<string, ProductRow>()
    for (const p of products) productMap.set(p.id, p)

    if (productMap.size === 0) {
      console.warn('[packages] No active products found')
      return []
    }

    // Fetch variants, filter hanya yang parentId ada di productMap
    const variants = (await db.productVariant.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: MAX_VARIANTS,
      select: {
        id: true,
        productId: true,
        name: true,
        slug: true,
        tier: true,
        sortOrder: true,
        price: true,
        priceValue: true,
        priceNote: true,
        ribbonLabel: true,
        ribbonColor: true,
        cardTitle: true,
        cardDescription: true,
        imageUrl: true,
        imageAlt: true,
        galleryImages: true,
      },
    } as never)) as Array<Omit<ProductVariantItem, 'parentName' | 'parentSlug' | 'category' | 'waNumber'>>

    // Join parent info
    const joined: ProductVariantItem[] = variants
      .filter((v) => productMap.has(v.productId))
      .map((v) => {
        const parent = productMap.get(v.productId)!
        return {
          ...v,
          parentName: parent.name,
          parentSlug: parent.slug,
          category: parent.category,
          waNumber: parent.waNumber,
        }
      })

    return joined
  } catch (err) {
    console.error('[packages] fetch error:', err)
    return []
  }
}

export async function Packages() {
  const variants = await getActiveVariants()

  return (
    <section
      id="paket"
      className="border-t border-border bg-background"
    >
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20">
        {/* Section header */}
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Paket Layanan
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Pilih paket pengerjaan sesuai kebutuhan &amp; budget mobil Anda.
            Scroll untuk menggeser produk.
          </p>
        </div>

        {/* Products carousel — 1 card per variant, 4 visible per batch */}
        <ProductsList variants={variants} />
      </div>
    </section>
  )
}

// Re-export untuk konsistensi API
export type { ProductVariantItem } from '@/components/landing/products-list'
