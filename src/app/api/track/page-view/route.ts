import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * POST /api/track/page-view
 *
 * Record page view untuk analytics. Anonymous (no auth required).
 *
 * Body:
 *  - pageType: 'article' | 'product' | 'variant' | 'home' | 'category' | 'search'
 *  - pageSlug: string | null
 *
 * Tracking dipasang di server component page.tsx (auto record saat render),
 * atau via client component ViewTracker.
 */
export async function POST(req: NextRequest) {
  let body: { pageType?: string; pageSlug?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Body tidak valid' }, { status: 400 })
  }

  const validTypes = ['article', 'product', 'variant', 'home', 'category', 'search']
  const pageType = body.pageType
  if (!pageType || !validTypes.includes(pageType)) {
    return NextResponse.json(
      { ok: false, message: `pageType harus salah satu: ${validTypes.join(', ')}` },
      { status: 400 },
    )
  }

  const pageSlug = body.pageSlug ?? null
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null
  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 45) ??
    req.headers.get('x-real-ip')?.slice(0, 45) ??
    null
  const referrer = req.headers.get('referer')?.slice(0, 500) ?? null

  try {
    await (db.pageView as unknown as { create: (args: unknown) => Promise<unknown> }).create({
      data: {
        id: `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        pageType,
        pageSlug,
        viewedAt: new Date().toISOString(),
        userAgent,
        ipAddress,
        referrer,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    // Mock mode: write failed (Supabase not configured) — silent fail supaya tidak ganggu UX
    console.warn('[api/track/page-view] mock mode (write skipped):', (err as Error)?.message?.slice(0, 80))
    return NextResponse.json({ ok: true, mock: true })
  }
}
