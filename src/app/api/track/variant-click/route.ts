import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * POST /api/track/variant-click
 *
 * Record klik card variant (dari carousel, sibling, related, atau search).
 * Anonymous (no auth).
 *
 * Body:
 *  - variantId: string (FK → ProductVariant.id)
 *  - source: 'carousel' | 'sibling' | 'related' | 'search'
 */
export async function POST(req: NextRequest) {
  let body: { variantId?: string; source?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Body tidak valid' }, { status: 400 })
  }

  const { variantId, source } = body
  if (!variantId) {
    return NextResponse.json({ ok: false, message: 'variantId wajib diisi' }, { status: 400 })
  }

  const validSources = ['carousel', 'sibling', 'related', 'search']
  if (!source || !validSources.includes(source)) {
    return NextResponse.json(
      { ok: false, message: `source harus salah satu: ${validSources.join(', ')}` },
      { status: 400 },
    )
  }

  const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null
  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 45) ??
    req.headers.get('x-real-ip')?.slice(0, 45) ??
    null

  try {
    await (db.variantClick as unknown as { create: (args: unknown) => Promise<unknown> }).create({
      data: {
        id: `vc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        variantId,
        source,
        clickedAt: new Date().toISOString(),
        userAgent,
        ipAddress,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.warn('[api/track/variant-click] mock mode:', (err as Error)?.message?.slice(0, 80))
    return NextResponse.json({ ok: true, mock: true })
  }
}
