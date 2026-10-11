/**
 * About section — section id="about".
 *
 * Innovation Car Audio Jakarta — workshop audio mobil & peredam suara
 * dengan pengalaman 20+ tahun. Spesialis upgrade audio mobil, DSP tuning,
 * instalasi speaker premium, dan peredam suara.
 *
 * Visual upgrades (per request user):
 * - Font diperbesar (heading text-4xl→5xl, body text-lg→xl)
 * - Layout menarik: 2-column dengan feature checklist kiri + FOMO card kanan
 * - FOMO elements: "Trusted by 1000+ pelanggan", live stats, urgency badges
 * - Animated counter di feature badges
 * - Gradient accents + glow effects
 */

import { CheckCircle2, Award, Users, Clock, Shield, Star, Zap, TrendingUp } from 'lucide-react'
import { Counter } from '@/components/landing/counter'

export function About() {
  const features = [
    {
      icon: Clock,
      title: '20+ Tahun Pengalaman',
      desc: 'Berpengalaman sejak 2004, melayani ribuan pelanggan di Jakarta & Jabodetabek.',
    },
    {
      icon: Shield,
      title: '100% Original Parts',
      desc: 'Authorized dealer brand premium. Semua komponen bergaransi resmi.',
    },
    {
      icon: Zap,
      title: 'DSP Tuning Profesional',
      desc: 'Tuning oleh teknisi bersertifikat EMMA & USACI. Suara sesuai akustik kendaraan.',
    },
    {
      icon: Award,
      title: 'Garansi Pengerjaan',
      desc: 'Garansi instalasi 1 bulan + free retune. Kepuasan pelanggan prioritas kami.',
    },
    {
      icon: Star,
      title: 'Free Konsultasi',
      desc: 'Konsultasi gratis via WhatsApp sebelum pengerjaan. Tanpa biaya, tanpa kewajiban.',
    },
    {
      icon: TrendingUp,
      title: '559+ Piala Kontes',
      desc: 'Track record terbukti: MURI SPL, Asia Champion EMMA, King of Sound Indonesia.',
    },
  ]

  return (
    <section
      id="about"
      className="relative bg-gradient-to-br from-background via-background to-red-950/20 py-16 sm:py-24 lg:py-28 overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-600/30 bg-red-600/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-500 mb-5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            Trusted Since 2004
          </div>

          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            Tentang{' '}
            <span
              className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent"
              style={{ textShadow: '0 0 40px rgba(220, 38, 38, 0.5)' }}
            >
              Innovation Car Audio
            </span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground font-medium">
            Workshop Audio Mobil & Peredam Suara Terbaik di Jakarta
          </p>
        </div>

        {/* 2-column layout: Description (left) + FOMO Stats Card (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* LEFT: Description (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            <p className="text-lg sm:text-xl text-foreground/90 leading-relaxed font-medium">
              <strong className="text-red-500">Innovation Car Audio Jakarta</strong> adalah workshop
              spesialis upgrade audio mobil dan peredam suara yang telah melayani pelanggan di Jakarta
              dan Jabodetabek selama lebih dari <strong className="text-red-500">20 tahun</strong>.
              Dengan pengalaman dan keahlian teknis yang mendalam, kami berkomitmen memberikan solusi
              audio mobil terbaik yang sesuai dengan kebutuhan dan budget setiap pelanggan.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Kami menawarkan berbagai paket upgrade audio mulai dari{' '}
              <strong className="text-foreground">Simple Upgrade</strong> untuk pengguna entry-level,{' '}
              <strong className="text-foreground">Entry</strong> dengan komponen aftermarket,{' '}
              <strong className="text-foreground">Daily Use</strong> untuk penggunaan harian dengan
              kualitas premium, hingga <strong className="text-foreground">Affordable High End</strong>{' '}
              untuk audiophile yang menginginkan kualitas suara terbaik. Setiap paket dilengkapi
              dengan DSP tuning profesional, instalasi rapi, dan garansi pengerjaan.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Sebagai authorized dealer dari brand-brand premium seperti{' '}
              <strong className="text-foreground">Rainbow, GZ Mercy, Blam, PHD, Infinity, Morel,</strong>{' '}
              dan <strong className="text-foreground">Prototype Quarto</strong>, kami memastikan semua
              komponen yang dipasang adalah 100% original dengan garansi resmi. Tim teknisi kami juga
              berpengalaman dalam instalasi peredam suara (soundproofing) untuk mendukung kualitas audio
              yang optimal di dalam kabin kendaraan.
            </p>
          </div>

          {/* RIGHT: FOMO Stats Card (2/5 width) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border-2 border-red-600/30 bg-gradient-to-br from-red-950/40 via-background to-red-950/20 p-6 sm:p-8 backdrop-blur-sm">
              {/* FOMO Header */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="size-7 rounded-full border-2 border-background bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-[10px] font-bold text-white"
                    >
                      ★
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wide">
                    Dipercaya Pelanggan
                  </div>
                  <div className="text-[10px] text-muted-foreground">1000+ instalasi selesai</div>
                </div>
              </div>

              {/* Big stats */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="text-center p-3 rounded-lg bg-red-600/5 border border-red-600/20">
                  <div
                    className="text-3xl sm:text-4xl font-extrabold text-red-500"
                    style={{ textShadow: '0 0 20px rgba(220, 38, 38, 0.6)' }}
                  >
                    <Counter value={559} suffix="+" duration={2.5} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                    Piala Kontes
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-600/5 border border-red-600/20">
                  <div
                    className="text-3xl sm:text-4xl font-extrabold text-red-500"
                    style={{ textShadow: '0 0 20px rgba(220, 38, 38, 0.6)' }}
                  >
                    <Counter value={17} suffix="+" duration={2} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                    Asia Champion
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-2 mb-5">
                {[
                  'MURI SPL Recipient',
                  'Euro Star Award 2019-2025',
                  'King of Sound Indonesia',
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-xs text-foreground/80"
                  >
                    <Award className="size-3.5 shrink-0 text-red-500" />
                    <span className="truncate">{badge}</span>
                  </div>
                ))}
              </div>

              {/* CTA FOMO */}
              <a
                href="#paket-audio"
                className="block w-full text-center rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] transition-all"
              >
                Lihat Paket Audio →
              </a>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Slot instalasi terbatas bulan ini
              </p>
            </div>
          </div>
        </div>

        {/* Feature grid (6 cards, 3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="group relative rounded-xl border border-border bg-card p-6 hover:border-red-600/40 hover:shadow-lg hover:shadow-red-600/10 transition-all"
              >
                {/* Glow on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-red-600/0 via-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:to-red-600/5 rounded-xl blur transition-all" />

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 flex items-center justify-center size-12 rounded-lg bg-red-600/10 border border-red-600/20 group-hover:bg-red-600/20 transition-colors">
                    <Icon className="size-6 text-red-500" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                  <CheckCircle2 className="size-5 shrink-0 text-red-500/50 group-hover:text-red-500 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom FOMO banner */}
        <div className="mt-12 sm:mt-16 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 p-6 sm:p-8 text-center shadow-xl shadow-red-600/30">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <Users className="size-8 text-white" />
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  <Counter value={1000} suffix="+" duration={2.5} useComma />
                </div>
                <div className="text-xs text-white/80 uppercase tracking-wide">Pelanggan Puas</div>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/30" />
            <div className="flex items-center gap-3">
              <Star className="size-8 text-white" />
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">4.9 / 5.0</div>
                <div className="text-xs text-white/80 uppercase tracking-wide">Rating Google</div>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/30" />
            <a
              href="https://wa.me/6281295952279?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-red-600 hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
            >
              <Zap className="size-4" />
              Konsultasi Gratis Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
