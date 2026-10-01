import { Phone, Package, ChevronRight } from 'lucide-react'

/**
 * Hero section — section id="home".
 * Match innovation-caraudio.com exactly:
 *  - Full background image with dark gradient overlay
 *  - Logo + 25 Years badge with gold glow
 *  - "Award Winning" gold gradient + "Car Audio And Soundproofing Store"
 *  - Description with "20+ tahun" gold highlight
 *  - Stats: 700 varian, 87 speaker, 12 brand, 559+ piala
 *  - CTA: "Lihat Paket Audio" (gold gradient) + "Konsultasi WhatsApp" (outline)
 *  - Counter stats: Varian, Piala, Asia Champion, Tahun
 *  - EURO STAR EMMA badge
 */
export function Hero() {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'url(/hero/hero-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark gradient overlay — match reference: 90deg left to right */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.3) 100%)',
          }}
        />
        {/* Gold radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 25% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          {/* Logo + 25 Years badge */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex items-center justify-center">
              {/* Gold glow effect */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #d4af37 0%, #f5c842 25%, transparent 50%, #a37e2b 75%, #d4af37 100%)',
                  filter: 'blur(8px)',
                  opacity: 0.6,
                  transform: 'scale(1.4)',
                }}
              />
              <div className="absolute inset-0 rounded-full bg-gold/30" style={{ filter: 'blur(20px)' }} />
              {/* 25 Years badge text */}
              <div className="relative h-28 md:h-36 w-28 md:w-36 rounded-full border-2 border-gold flex flex-col items-center justify-center bg-black/60">
                <span className="text-2xl md:text-3xl font-bold text-gold" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                  25
                </span>
                <span className="text-[10px] md:text-xs text-gold-light uppercase tracking-wide">Years</span>
                <span className="text-[8px] md:text-[10px] text-gold/70 uppercase tracking-wider mt-0.5">Experience</span>
              </div>
              {/* Rotating gold dots */}
              <div className="absolute w-1.5 h-1.5 rounded-full bg-gold" style={{ top: '50%', left: '50%', transformOrigin: 'center', transform: 'rotate(0deg) translateX(70px)' }} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-gold" style={{ top: '50%', left: '50%', transformOrigin: 'center', transform: 'rotate(90deg) translateX(70px)' }} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-gold" style={{ top: '50%', left: '50%', transformOrigin: 'center', transform: 'rotate(180deg) translateX(70px)' }} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-gold" style={{ top: '50%', left: '50%', transformOrigin: 'center', transform: 'rotate(270deg) translateX(70px)' }} />
            </div>
          </div>

          {/* Main heading */}
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-[1.1]"
            style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              Award Winning
            </span>
            <br />
            Car Audio And
            <br />
            Soundproofing Store
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-foreground/90 mb-3 max-w-xl font-medium">
            Workshop audio mobil dan peredam suara terbaik Jakarta.
          </p>
          <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-xl leading-relaxed">
            Dengan pengalaman <span className="text-gold font-semibold">20+ tahun</span>, kami membantu Anda
            merancang solusi sistem audio mobil dengan pilihan produk merek internasional — dari entry level
            hingga competition grade.
          </p>

          {/* Stats summary */}
          <p className="text-xs text-muted-foreground/70 mb-8 max-w-xl">
            📊 84 varian paket · 87 speaker premium · 17 brand internasional · 559+ piala kontes audio
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
            <a
              href="#paket-audio"
              className="inline-flex items-center justify-center gap-2 text-sm transition-all h-10 rounded-md px-6 bg-gradient-to-r from-gold via-gold-light to-gold text-black font-semibold hover:opacity-90 shrink-0"
            >
              <Package className="size-4" />
              Lihat Paket Audio
              <ChevronRight className="size-4" />
            </a>
            <a
              href="https://wa.me/6281295952279?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm transition-all h-10 rounded-md px-6 border border-gold/40 bg-black/40 hover:bg-gold/10 text-white font-medium shrink-0 backdrop-blur-sm"
            >
              <Phone className="size-4" />
              Konsultasi WhatsApp
            </a>
          </div>

          {/* Counter stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '84', label: 'Varian Paket' },
              { value: '559+', label: 'Piala Kontes' },
              { value: '17+', label: 'Asia Champion' },
              { value: '25+', label: 'Tahun' },
            ].map((stat, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gold" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* EURO STAR badge */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/60">
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-2 py-0.5">
              ⭐ EURO STAR EMMA 2019-2025
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-2 py-0.5">
              👑 King of Sound ID
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-2 py-0.5">
              🏆 17+ Asia Champion
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
