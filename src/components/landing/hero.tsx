import { Phone, Package, ChevronRight } from 'lucide-react'

/**
 * Hero section — section id="home".
 * Match innovation-caraudio.com:
 *  - Dark background
 *  - "Award Winning Car Audio And Soundproofing Store" heading
 *  - CTA: "Lihat Paket Audio" + "Konsultasi WhatsApp"
 *  - "25 Years Experience" badge
 */
export function Hero() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-black min-h-[500px] sm:min-h-[600px] flex items-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/70" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 relative z-10 py-16 sm:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 mb-6">
            <span className="text-xs font-bold text-gold tracking-wide" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              ⭐ 25 YEARS EXPERIENCE
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Award Winning
            <br />
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              Car Audio And
            </span>
            <br />
            Soundproofing Store
          </h1>

          <p className="text-base sm:text-lg text-white/70 mb-8 max-w-2xl leading-relaxed">
            Workshop audio mobil & peredam suara terbaik di Jakarta. Spesialis upgrade audio,
            DSP tuning, instalasi speaker premium, dan peredam suara dengan pengalaman 25+ tahun.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="#paket-audio"
              className="inline-flex items-center gap-2 rounded-lg bg-gold hover:bg-gold-dark text-black font-semibold px-6 py-3 text-sm transition-colors"
            >
              <Package className="size-4" />
              Lihat Paket Audio
              <ChevronRight className="size-4" />
            </a>
            <a
              href="https://wa.me/6281295952279?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3 text-sm transition-colors backdrop-blur-sm"
            >
              <Phone className="size-4" />
              Konsultasi WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
