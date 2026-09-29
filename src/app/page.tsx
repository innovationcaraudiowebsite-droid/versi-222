import { LandingHeader } from '@/components/landing/landing-header'
import { Hero } from '@/components/landing/hero'
import { About } from '@/components/landing/about'
import { Education } from '@/components/landing/education'
import { Packages } from '@/components/landing/packages'
import { LatestArticles } from '@/components/landing/latest-articles'
import { SectionDivider } from '@/components/landing/section-divider'
import { LandingFooter } from '@/components/landing/landing-footer'
import { StatsBar, WhyChooseUs, CTASection } from '@/components/landing/new-sections'
import {
  BrandPartners,
  AwardsSection,
  VideoSection,
  RecommenderSection,
  AreaServisSection,
  LokasiSection,
  FAQSection,
  TestimoniSection,
} from '@/components/landing/ref-sections'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Landing page "Innovation Car Audio Jakarta" — root route `/`.
 *
 * 13 Sections (match innovation-caraudio.com):
 *  1. #home (Hero)        — Award Winning Car Audio And Soundproofing Store
 *  2. #about              — Workshop Audio Mobil & Spesialis Peredam Jakarta
 *  3. #partners           — Brand Partner Resmi (18 brands)
 *  4. #awards             — Award & Championship (559+ piala)
 *  5. #why-us             — Mengapa Memilih Innovation?
 *  6. #video              — Galeri Instalasi & Workshop
 *  7. #paket-audio        — Paket Audio (84 varian carousel)
 *  8. #peredam            — Paket Peredam (Jenis Bahan)
 *  9. #recommender        — Product Matchmaking
 * 10. #area-jabodetabek   — Area Servis
 * 11. #testimoni          — Testimoni Pelanggan
 * 12. #lokasi             — Kontak & Lokasi
 * 13. #faq               — FAQ
 *
 * + Footer multi-column
 */
export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        {/* Section 1: Hero (#home) */}
        <Hero />

        {/* Section 2: Stats Bar */}
        <StatsBar />

        {/* Section 3: About (#about) */}
        <SectionDivider variant="line" />
        <About />

        {/* Section 4: Brand Partners (#partners) */}
        <SectionDivider variant="line" />
        <BrandPartners />

        {/* Section 5: Awards (#awards) */}
        <AwardsSection />

        {/* Section 6: Why Choose Us (#why-us) */}
        <WhyChooseUs />

        {/* Section 7: Video (#video) */}
        <VideoSection />

        {/* Section 8: Paket Audio (#paket-audio) */}
        <SectionDivider variant="line" />
        <Packages />

        {/* Section 9: Paket Peredam (#peredam) */}
        <SectionDivider variant="line" />
        <Education />

        {/* Section 10: Artikel Terbaru */}
        <SectionDivider variant="line" />
        <LatestArticles />

        {/* Section 11: Recommender (#recommender) */}
        <RecommenderSection />

        {/* Section 12: Area Servis (#area-jabodetabek) */}
        <AreaServisSection />

        {/* Section 13: Testimoni (#testimoni) */}
        <TestimoniSection />

        {/* Section 14: CTA */}
        <CTASection />

        {/* Section 15: Lokasi (#lokasi) */}
        <LokasiSection />

        {/* Section 16: FAQ (#faq) */}
        <FAQSection />
      </main>

      {/* Footer: multi-column */}
      <LandingFooter />
    </div>
  )
}
