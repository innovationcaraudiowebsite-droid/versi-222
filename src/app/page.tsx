import { LandingHeader } from '@/components/landing/landing-header'
import { Hero } from '@/components/landing/hero'
import { About } from '@/components/landing/about'
import { Education } from '@/components/landing/education'
import { Packages } from '@/components/landing/packages'
import { LatestArticles } from '@/components/landing/latest-articles'
import { SectionDivider } from '@/components/landing/section-divider'
import { LandingFooter } from '@/components/landing/landing-footer'
import { StatsBar, WhyChooseUs, CTASection, TestimoniSection, SocialMediaSection } from '@/components/landing/new-sections'

// Always render at request time (runtime) — Vercel injects env vars at
// runtime, not build time. force-dynamic prevents build-time DB queries
// that would fail when SUPABASE_URL / DATABASE_URL aren't available during
// the "Collecting page data" build phase.
export const dynamic = 'force-dynamic'
// Revalidate hint (ignored when force-dynamic, kept for documentation).
export const revalidate = 0

/**
 * Landing page "Innovation Car Audio Jakarta" — root route `/`.
 *
 * Sections:
 *  1. Hero             — banner gambar lengkap (sudah berisi judul, subtitle, icon)
 *  2. Stats Bar        — 4 stat cards (20+ tahun, 1000+ instalasi, 84 paket, 4.9★)
 *  3. About            — info tentang Innovation Car Audio (20+ tahun, spesialis)
 *  4. Jenis Bahan      — 4 jenis material peredam (Butyl, Absorber, Spant, Nex)
 *  5. Paket Layanan    — carousel 84 varian produk (4-card per batch)
 *  6. Artikel Terbaru  — carousel semua artikel (pre-load 30, slide animation)
 *  7. Why Choose Us    — 4 feature cards
 *  8. Testimoni        — 3 testimoni pelanggan
 *  9. CTA              — konsultasi WhatsApp
 * 10. Social Media     — Instagram, YouTube, Facebook links
 *
 * Footer: multi-column (brand + layanan + kontak + social).
 */
export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        {/* Section 1: Hero (gambar saja) */}
        <Hero />

        {/* Section 2: Stats Bar */}
        <StatsBar />

        {/* Divider: Hero → About */}
        <SectionDivider variant="line" />

        {/* Section 3: About (judul + info Innovation Car Audio) */}
        <About />

        {/* Divider: About → Jenis Bahan */}
        <SectionDivider variant="line" />

        {/* Section 4: Jenis Bahan Peredam & Fungsinya */}
        <Education />

        {/* Divider: Jenis Bahan → Paket */}
        <SectionDivider variant="line" />

        {/* Section 5: Paket Layanan (carousel — pre-load all, slide animation) */}
        <Packages />

        {/* Divider: Paket → Artikel */}
        <SectionDivider variant="line" />

        {/* Section 6: Artikel Terbaru (carousel — pre-load all, slide animation) */}
        <LatestArticles />

        {/* Section 7: Why Choose Us */}
        <WhyChooseUs />

        {/* Section 8: Testimoni */}
        <TestimoniSection />

        {/* Section 9: CTA — Konsultasi WhatsApp */}
        <CTASection />

        {/* Section 10: Social Media */}
        <SocialMediaSection />
      </main>

      {/* Footer: multi-column */}
      <LandingFooter />
    </div>
  )
}
