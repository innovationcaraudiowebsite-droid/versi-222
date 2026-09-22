import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * PUT /api/admin/products/[id]/variants/[variantId]
 * Update existing variant.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { id: productId, variantId } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Body tidak valid' }, { status: 400 })
  }

  try {
    const now = new Date().toISOString()
    const updates = {
      name: typeof body.name === 'string' ? body.name : undefined,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      tier: typeof body.tier === 'string' ? body.tier : undefined,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
      price: typeof body.price === 'string' ? body.price : undefined,
      priceValue: typeof body.priceValue === 'number' ? body.priceValue : undefined,
      priceNote: body.priceNote as string | null,
      ribbonLabel: body.ribbonLabel as string | null,
      ribbonColor: body.ribbonColor as string | null,
      cardTitle: body.cardTitle as string | null,
      cardDescription: body.cardDescription as string | null,
      imageUrl: body.imageUrl as string | null,
      imageAlt: body.imageAlt as string | null,
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : undefined,
      tagline: body.tagline as string | null,
      introMarkdown: body.introMarkdown as string | null,
      sections: body.sections,
      closingTagline: body.closingTagline as string | null,
      closingComponents: Array.isArray(body.closingComponents) ? body.closingComponents : undefined,
      disclaimer: body.disclaimer as string | null,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
      updatedAt: now,
    }

    // Filter undefined values
    const cleanUpdates: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) cleanUpdates[k] = v
    }

    try {
      await (db.productVariant as unknown as { update: (args: unknown) => Promise<unknown> }).update({
        where: { id: variantId, productId },
        data: cleanUpdates,
      })
    } catch (writeErr) {
      console.warn('[api/admin/variants PUT] Mock mode: write failed:', (writeErr as Error)?.message)
      return NextResponse.json({
        ok: false,
        message: 'MOCK MODE: Update tidak disimpan permanen. Connect Supabase untuk persist.',
        mock: true,
      }, { status: 503 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/admin/products/[id]/variants/[variantId] PUT] error:', err)
    return NextResponse.json({ ok: false, message: 'Gagal update varian' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/products/[id]/variants/[variantId]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { id: productId, variantId } = await params

  try {
    try {
      await (db.productVariant as unknown as { delete: (args: unknown) => Promise<unknown> }).delete({
        where: { id: variantId, productId },
      })
    } catch (writeErr) {
      console.warn('[api/admin/variants DELETE] Mock mode:', (writeErr as Error)?.message)
      return NextResponse.json({
        ok: false,
        message: 'MOCK MODE: Delete tidak permanen. Connect Supabase.',
        mock: true,
      }, { status: 503 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/admin/variants DELETE] error:', err)
    return NextResponse.json({ ok: false, message: 'Gagal menghapus varian' }, { status: 500 })
  }
}
