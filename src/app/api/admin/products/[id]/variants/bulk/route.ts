import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * POST /api/admin/products/[id]/variants/bulk
 * Bulk activate/deactivate all variants of a product.
 *
 * Body: { action: 'activate' | 'deactivate' }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { id: productId } = await params

  let body: { action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Body tidak valid' }, { status: 400 })
  }

  const action = body.action
  if (action !== 'activate' && action !== 'deactivate') {
    return NextResponse.json({ ok: false, message: 'Action harus "activate" atau "deactivate"' }, { status: 400 })
  }

  const isActive = action === 'activate'

  try {
    try {
      await (db.productVariant as unknown as { updateMany: (args: unknown) => Promise<unknown> }).updateMany({
        where: { productId },
        data: { isActive, updatedAt: new Date().toISOString() },
      })
    } catch (writeErr) {
      console.warn('[api/admin/variants/bulk] Mock mode:', (writeErr as Error)?.message)
      return NextResponse.json({
        ok: false,
        message: 'MOCK MODE: Bulk update tidak permanen. Connect Supabase.',
        mock: true,
      }, { status: 503 })
    }

    return NextResponse.json({
      ok: true,
      message: `Semua varian ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
    })
  } catch (err) {
    console.error('[api/admin/variants/bulk] error:', err)
    return NextResponse.json({ ok: false, message: 'Gagal bulk update varian' }, { status: 500 })
  }
}
