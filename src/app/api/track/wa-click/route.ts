import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * POST /api/track/wa-click
 *
 * Record klik tombol "Tanya via WhatsApp" di detail page variant.
 * Anonymous (no auth).
 *
 * Body:
 *  - variantId: string (FK → ProductVariant.id)
 */
export async function POST(req: NextRequest) {
  let body: { variantId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Body tidak valid' }, { status: 400 })
  }

  const { variantId } = body
  if (!variantId) {
    return NextResponse.json({ ok: false, message: 'variantId wajib diisi' }, { status: 400 })
  }

  const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null
  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 45) ??
    req.headers.get('x-real-ip')?.slice(0, 45) ??
    null

  try {
    await (db.waClick as unknown as { create: (args: unknown) => Promise<unknown> }).create({
      data: {
        id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        variantId,
        clickedAt: new Date().toISOString(),
        userAgent,
        ipAddress,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.warn('[api/track/wa-click] mock mode:', (err as Error)?.message?.slice(0, 80))
    return NextResponse.json({ ok: true, mock: true })
  }
}
