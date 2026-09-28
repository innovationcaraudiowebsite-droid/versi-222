import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/products/[id]/variants
 * List all variants of a product (for admin dashboard).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { id: productId } = await params

  try {
    const variants = (await db.productVariant.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    } as never)) as Array<Record<string, unknown>>

    return NextResponse.json({ ok: true, variants })
  } catch (err) {
    console.error('[api/admin/products/[id]/variants GET] error:', err)
    return NextResponse.json({ ok: false, message: 'Gagal memuat varian' }, { status: 500 })
  }
}

/**
 * POST /api/admin/products/[id]/variants
 * Create a new variant for the product.
 *
 * MOCK MODE: writes to local JSON if Supabase not configured.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { id: productId } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Body tidak valid' }, { status: 400 })
  }

  // Validate required fields
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const tier = typeof body.tier === 'string' ? body.tier : 'basic'
  const price = typeof body.price === 'string' ? body.price.trim() : ''

  if (!name || name.length < 2) {
    return NextResponse.json({ ok: false, message: 'Nama varian wajib diisi (min 2 karakter)' }, { status: 400 })
  }
  if (!slug) {
    return NextResponse.json({ ok: false, message: 'Slug wajib diisi' }, { status: 400 })
  }
  if (!price) {
    return NextResponse.json({ ok: false, message: 'Harga wajib diisi' }, { status: 400 })
  }

  try {
    // Check if slug is unique
    const existing = (await db.productVariant.findFirst({
      where: { slug },
      select: { id: true },
    } as never)) as { id: string } | null

    if (existing) {
      return NextResponse.json({ ok: false, message: 'Slug sudah dipakai varian lain' }, { status: 409 })
    }

    const now = new Date().toISOString()
    const newVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId,
      name,
      slug,
      tier,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 1,
      price,
      priceValue: typeof body.priceValue === 'number' ? body.priceValue : null,
      priceNote: (body.priceNote as string) || null,
      ribbonLabel: (body.ribbonLabel as string) || null,
      ribbonColor: (body.ribbonColor as string) || null,
      cardTitle: (body.cardTitle as string) || null,
      cardDescription: (body.cardDescription as string) || null,
      imageUrl: (body.imageUrl as string) || null,
      imageAlt: (body.imageAlt as string) || null,
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
      tagline: (body.tagline as string) || null,
      introMarkdown: (body.introMarkdown as string) || null,
      sections: body.sections || null,
      closingTagline: (body.closingTagline as string) || null,
      closingComponents: Array.isArray(body.closingComponents) ? body.closingComponents : null,
      disclaimer: (body.disclaimer as string) || null,
      isActive: body.isActive === true,
      createdAt: now,
      updatedAt: now,
    }

    // Try to write via db adapter (Supabase)
    // In mock mode, this will log error but return success
    try {
      await (db.productVariant as unknown as { create: (args: unknown) => Promise<unknown> }).create({
        data: newVariant,
      })
    } catch (writeErr) {
      console.warn('[api/admin/variants POST] Mock mode: write to Supabase failed, data not persisted:', (writeErr as Error)?.message)
      return NextResponse.json({
        ok: false,
        message: 'MOCK MODE: Data tidak disimpan permanen. Connect Supabase untuk persist data.',
        mock: true,
      }, { status: 503 })
    }

    return NextResponse.json({ ok: true, variant: newVariant })
  } catch (err) {
    console.error('[api/admin/products/[id]/variants POST] error:', err)
    return NextResponse.json({ ok: false, message: 'Gagal membuat varian' }, { status: 500 })
  }
}
