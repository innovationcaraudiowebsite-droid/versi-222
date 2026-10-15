import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Package } from 'lucide-react'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'
import { PeredamGrid } from '@/components/landing/peredam-grid'
import { getPeredamPackages } from '@/lib/db'

/**
 * Halaman kategori paket peredam — /paket/peredam
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Paket Peredam Mobil — Rp 6.9jt - 13.2jt | Innovation Car Audio Jakarta',
  description: 'Paket peredam suara mobil dengan material premium (Gran Turismo 2.0, GT Isolator Carpet, Nitto Spoon). 4 tier: Basic, Normal, Best Buy, Recommended. Konsultasi gratis.',
  keywords: [
    'paket peredam mobil',
    'peredam suara mobil',
    'peredam audio mobil',
    'innovation car audio',
    'jakarta',
  ],
  openGraph: {
    title: 'Paket Peredam Mobil — Innovation Car Audio Jakarta',
    description: 'Paket peredam suara mobil dengan material premium. 4 tier tersedia.',
  },
}

export default async function PaketPeredamPage() {
  const packages = await getPeredamPackages()

  const breadcrumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Paket Audio', href: '/#paket-audio' },
    { label: 'Peredam', href: '/paket/peredam' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
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

          <div className="mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-wider text-gold mb-4">
              <Package className="size-3" />
              4 Varian Tersedia
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Paket Peredam Mobil
            </h1>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
              Peredam suara mobil dengan material premium (Gran Turismo 2.0, GT Isolator Carpet, Nitto Spoon). Tingkatkan kenyamanan kabin dan kualitas audio mobil Anda.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                <span className="text-muted-foreground">Range Harga:</span>
                <span className="font-bold text-gold">Rp 6.9jt - 13.2jt</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                <span className="text-muted-foreground">Varian:</span>
                <span className="font-bold">4 paket</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-bold">30 - 66 lembar</span>
              </span>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center mr-1">Kategori lain:</span>
            <Link href="/paket/simple-upgrade" className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-gold/40 hover:bg-muted transition-colors">Simple<ChevronRight className="size-3" /></Link>
            <Link href="/paket/entry" className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-gold/40 hover:bg-muted transition-colors">Entry<ChevronRight className="size-3" /></Link>
            <Link href="/paket/daily-use" className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-gold/40 hover:bg-muted transition-colors">Daily<ChevronRight className="size-3" /></Link>
            <Link href="/paket/affordable-high-end" className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-gold/40 hover:bg-muted transition-colors">AHE<ChevronRight className="size-3" /></Link>
          </div>

          {packages && packages.length > 0 ? (
            <PeredamGrid packages={packages} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">Belum ada paket peredam tersedia.</p>
            </div>
          )}

          <div className="mt-12 rounded-2xl bg-gradient-to-r from-gold to-gold-dark p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Bingung pilih paket peredam?</h2>
            <p className="text-white/80 mb-4 text-sm sm:text-base">Konsultasi gratis dengan teknisi kami. Dapatkan rekomendasi sesuai kebutuhan dan budget Anda.</p>
            <a href="https://wa.me/6282211222989?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi%20paket%20peredam%20mobil" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-black hover:bg-white/90 hover:scale-105 transition-all shadow-lg">💬 Konsultasi WhatsApp</a>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
