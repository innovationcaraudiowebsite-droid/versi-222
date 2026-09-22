import { db } from '@/lib/db'
import { ProductsList, type ProductItem } from '@/components/landing/products-list'

/**
 * Paket Layanan section — section id="paket".
 *
 * CAROUSEL MODE (sama seperti LatestArticles, sesuai brief user revisi):
 *  - Server fetch ALL produk aktif (limit 50) sekali saja di SSR.
 *  - Pass ke ProductsList client component yang render semua produk di DOM.
 *  - Container overflow:hidden, hanya 4 card visible (1 col × 4 row di mobile,
 *    2 col × 2 row di tablet/desktop).
 *  - Scroll/swipe → CSS transform translateY → slide ke 4 card berikutnya.
 *  - NO API reload — pure CSS animation, instant.
 *
 * Layout card: VERTICAL (gambar atas aspect-video + konten bawah).
 *  - Badge kategori
 *  - Title (line-clamp-1)
 *  - Description (line-clamp-2)
 *  - (Harga & CTA WhatsApp per produk dihapus — user request.)
 *
 * Filter: hanya produk dengan isActive=true, urut by sortOrder ASC.
 */

export const dynamic = 'force-dynamic'

const MAX_PRODUCTS = 50 // limit supaya tidak berat (kalau DB punya ratusan)

type PaketProduct = ProductItem

async function getActiveProducts(): Promise<PaketProduct[]> {
  try {
    const products = (await db.product.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: MAX_PRODUCTS,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        imageUrl: true,
        imageAlt: true,
        sortOrder: true,
      },
    } as never)) as PaketProduct[]

    return products
  } catch (err) {
    console.error('[packages] fetch error:', err)
    return []
  }
}

export async function Packages() {
  const products = await getActiveProducts()

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

        {/* Products carousel — pre-load all, slide animation (no reload) */}
        <ProductsList products={products as ProductItem[]} />
      </div>
    </section>
  )
}

// Re-export untuk konsistensi API
export type { ProductItem } from '@/components/landing/products-list'
