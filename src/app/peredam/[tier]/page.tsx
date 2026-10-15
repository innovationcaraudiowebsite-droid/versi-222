import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Package } from 'lucide-react'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'
import { PeredamDetail } from '@/components/landing/peredam-detail'
import { getPeredamPackages, getPeredamOptional } from '@/lib/db'

/**
 * Halaman detail paket peredam — /peredam/[tier]
 *
 * Menampilkan detail 1 paket peredam dengan:
 *  - AI image + ribbon miring
 *  - Harga coret + harga akhir + badge hemat
 *  - Accordion: Detail Area Instalasi
 *  - Accordion: Bahan yang Dipakai
 *  - Checkbox: Item Optional (add-on)
 *  - CTA: Pesan via WhatsApp
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ============================================================
// generateStaticParams — pre-render 4 tier pages
// ============================================================
export async function generateStaticParams() {
  const packages = await getPeredamPackages()
  return (packages as Array<{ slug: string }>).map((p) => ({ tier: p.slug }))
}

// ============================================================
// generateMetadata — SEO per tier
// ============================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tier: string }>
}): Promise<Metadata> {
  const { tier } = await params
  const packages = await getPeredamPackages()
  const pkg = (packages as Array<Record<string, unknown>>).find((p) => p.slug === tier)

  if (!pkg) {
    return { title: 'Paket Peredam Tidak Ditemukan' }
  }

  const name = String(pkg.name || '')
  const priceFinal = String(pkg.priceFinal || '')
  const totalLayers = String(pkg.totalLayers || '')

  return {
    title: `Peredam ${name} — ${priceFinal} | Innovation Car Audio Jakarta`,
    description: `Paket peredam mobil ${name} dengan ${totalLayers} lembar bahan premium. Harga ${priceFinal} setelah diskon. Konsultasi gratis via WhatsApp.`,
    keywords: [
      `peredam ${name.toLowerCase()}`,
      'paket peredam mobil',
      'peredam suara mobil',
      'innovation car audio',
      'jakarta',
    ],
    openGraph: {
      title: `Peredam ${name} — Innovation Car Audio Jakarta`,
      description: `Paket peredam mobil ${name}. ${totalLayers} lembar bahan premium.`,
    },
  }
}

// ============================================================
// Page component
// ============================================================
export default async function PeredamDetailPage({
  params,
}: {
  params: Promise<{ tier: string }>
}) {
  const { tier } = await params
  const packages = await getPeredamPackages()
  const pkg = (packages as Array<Record<string, unknown>>).find((p) => p.slug === tier)

  if (!pkg) {
    notFound()
  }

  // Get optional items
  const optionalItems = await getPeredamOptional()

  const breadcrumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Paket Audio', href: '/#paket-audio' },
    { label: 'Peredam', href: '/paket/peredam' },
    { label: String(pkg.name || ''), href: `/peredam/${tier}` },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5" />}
                <Link href={b.href} className="hover:text-foreground transition-colors">
                  {b.label}
                </Link>
              </span>
            ))}
          </nav>

          <PeredamDetail pkg={pkg as Record<string, unknown>} optionalItems={optionalItems as Array<Record<string, unknown>>} />
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
