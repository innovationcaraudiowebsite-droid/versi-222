import { NextRequest, NextResponse } from 'next/server'

import { requireAdminApi } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

interface CreateBody {
  name?: unknown
  slug?: unknown
  category?: unknown
  shortDescription?: unknown
  imageUrl?: unknown
  imageAlt?: unknown
  waNumber?: unknown
  sortOrder?: unknown
  isActive?: unknown
}

function asString(v: unknown, max?: number): string | undefined {
  if (typeof v !== 'string') return undefined
  const trimmed = v.trim()
  if (trimmed === '') return undefined
  return max ? trimmed.slice(0, max) : trimmed
}

function asInt(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v)
  if (typeof v === 'string') {
    const n = parseInt(v, 10)
    if (!Number.isNaN(n)) return n
  }
  return fallback
}

/**
 * GET /api/admin/products — list all products (for admin dashboard).
 * Optional query: ?category=Paket%20Layanan&active=true
 */
export async function GET(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const activeOnly = searchParams.get('active') === 'true'

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (activeOnly) where.isActive = true

  try {
    const products = await db.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ ok: true, products })
  } catch (err) {
    console.error('[api/admin/products GET] error:', err)
    return NextResponse.json({ ok: false, message: 'Gagal memuat produk.' }, { status: 500 })
  }
}

/**
 * POST /api/admin/products — create new product.
 * Required: name, category, waNumber.
 */
export async function POST(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  let body: CreateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Body tidak valid.' }, { status: 400 })
  }

  const name = asString(body.name, 120)
  if (!name || name.length < 3) {
    return NextResponse.json(
      { ok: false, message: 'Nama produk wajib minimal 3 karakter.' },
      { status: 400 },
    )
  }

  const slug = asString(body.slug, 120)
  if (!slug) {
    return NextResponse.json(
      { ok: false, message: 'Slug wajib diisi.' },
      { status: 400 },
    )
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { ok: false, message: 'Slug hanya boleh huruf kecil, angka, dan dash.' },
      { status: 400 },
    )
  }

  const category = asString(body.category, 60)
  if (!category) {
    return NextResponse.json(
      { ok: false, message: 'Kategori wajib diisi.' },
      { status: 400 },
    )
  }

  const waNumber = asString(body.waNumber, 20)
  if (!waNumber) {
    return NextResponse.json(
      { ok: false, message: 'Nomor WA admin wajib diisi.' },
      { status: 400 },
    )
  }

  // Check slug uniqueness
  try {
    const existing = (await db.product.findFirst({
      where: { slug },
      select: { id: true },
    } as never)) as { id: string } | null
    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'Slug sudah dipakai produk lain. Gunakan slug unik.' },
        { status: 409 },
      )
    }
  } catch (err) {
    // Mock mode: Supabase not configured — skip uniqueness check
    console.warn('[api/admin/products POST] slug check skipped (mock mode):', (err as Error)?.message?.slice(0, 80))
  }

  try {
    const product = await db.product.create({
      data: {
        name,
        slug,
        category,
        shortDescription: asString(body.shortDescription, 120) ?? null,
        imageUrl: asString(body.imageUrl) ?? null,
        imageAlt: asString(body.imageAlt, 120) ?? null,
        waNumber,
        sortOrder: asInt(body.sortOrder, 1),
        isActive: body.isActive !== false, // default true
      },
    })
    return NextResponse.json({ ok: true, product })
  } catch (err) {
    console.error('[api/admin/products POST] error:', err)
    // Mock mode: Supabase not configured — return mock success dengan generated ID
    const mockErr = err as Error
    const errMsg = mockErr?.message || ''
    if (
      errMsg.includes('Missing SUPABASE_URL') ||
      errMsg.includes('fetch failed') ||
      errMsg.includes('Supabase')
    ) {
      const mockId = `prod-mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      return NextResponse.json({
        ok: true,
        product: {
          id: mockId,
          name,
          slug,
          category,
          shortDescription: asString(body.shortDescription, 120) ?? null,
          imageUrl: asString(body.imageUrl) ?? null,
          imageAlt: asString(body.imageAlt, 120) ?? null,
          waNumber,
          sortOrder: asInt(body.sortOrder, 1),
          isActive: body.isActive !== false,
        },
        mock: true,
        message: 'MOCK MODE: Data tidak disimpan permanen. Connect Supabase untuk persist data.',
      })
    }
    return NextResponse.json({ ok: false, message: 'Gagal membuat produk.' }, { status: 500 })
  }
}
