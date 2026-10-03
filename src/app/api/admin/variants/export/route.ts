import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/variants/export
 * Export all variants as CSV file.
 * Query: ?filtered=true to export only filtered results (not implemented — exports all).
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  try {
    // Fetch all variants
    const variants = (await db.productVariant.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, productId: true, name: true, slug: true, tier: true,
        sortOrder: true, price: true, priceValue: true, priceNote: true,
        ribbonLabel: true, ribbonColor: true, cardTitle: true, cardDescription: true,
        imageUrl: true, isActive: true, createdAt: true, updatedAt: true,
      },
    } as never)) as Array<Record<string, unknown>>

    // Fetch products for parent name join
    const products = (await db.product.findMany({
      select: { id: true, name: true, category: true, subCategory: true },
    } as never)) as Array<Record<string, unknown>>

    const productMap = new Map<string, { name: string; category: string; subCategory: string }>()
    for (const p of products) {
      productMap.set(p.id as string, {
        name: p.name as string,
        category: p.category as string,
        subCategory: (p as any).subCategory || '',
      })
    }

    // Build CSV
    const headers = [
      'id', 'product_name', 'category', 'sub_category', 'variant_name',
      'slug', 'tier', 'sort_order', 'price', 'price_value',
      'ribbon_label', 'ribbon_color', 'card_title', 'card_description',
      'image_url', 'is_active', 'detail_url', 'created_at', 'updated_at',
    ]

    const SITE_URL = 'https://www.innovation-caraudio.com'

    const csvRows: string[] = []
    // Header row
    csvRows.push(headers.join(','))

    // Data rows
    for (const v of variants) {
      const parent = productMap.get(v.productId as string) || { name: '', category: '', subCategory: '' }
      const row = [
        v.id,
        parent.name,
        parent.category,
        parent.subCategory,
        v.name,
        v.slug,
        v.tier,
        v.sortOrder,
        v.price,
        v.priceValue ?? '',
        v.ribbonLabel ?? '',
        v.ribbonColor ?? '',
        v.cardTitle ?? '',
        v.cardDescription ?? '',
        v.imageUrl ?? '',
        v.isActive ? 'true' : 'false',
        `${SITE_URL}/produk/${v.slug}`,
        v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt,
        v.updatedAt instanceof Date ? v.updatedAt.toISOString() : v.updatedAt,
      ]

      // Escape CSV values (wrap in quotes if contains comma, quote, or newline)
      const escaped = row.map((val) => {
        const str = String(val ?? '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      csvRows.push(escaped.join(','))
    }

    const csv = '\uFEFF' + csvRows.join('\n') // BOM for Excel

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="variants-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    console.error('[api/admin/variants/export] error:', err)
    return NextResponse.json({ ok: false, message: 'Gagal export CSV' }, { status: 500 })
  }
}
