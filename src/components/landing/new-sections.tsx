import { Award, Users, Package, Star, Wrench, ShieldCheck, Headphones, Clock } from 'lucide-react'

/**
 * StatsBar — 4 stat cards di bawah hero.
 * Background: gradient red.
 */
export function StatsBar() {
  const stats = [
    { icon: Award, value: '20+', label: 'Tahun Pengalaman', color: 'text-green-300' },
    { icon: Users, value: '1000+', label: 'Instalasi Selesai', color: 'text-green-300' },
    { icon: Package, value: '84', label: 'Paket Tersedia', color: 'text-green-300' },
    { icon: Star, value: '4.9★', label: 'Rating Google', color: 'text-yellow-300' },
  ]
  return (
    <section className="bg-gradient-to-r from-green-600 to-green-800 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <Icon className={`size-8 mb-2 ${s.color}`} />
                <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-red-100 mt-1">{s.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * WhyChooseUs — 4 feature cards.
 */
export function WhyChooseUs() {
  const features = [
    { icon: Award, title: '20+ Tahun Exp', desc: 'Pengalaman dalam instalasi audio mobil & peredam suara.' },
    { icon: ShieldCheck, title: '100% Original Parts', desc: 'Semua komponen resmi: Rainbow, GZ Mercy, Blam, PHD, Prototype Quarto.' },
    { icon: Headphones, title: 'Garansi Tuning', desc: 'Final DSP tuning dengan garansi penyesuaian 1 bulan.' },
    { icon: Clock, title: 'Free Konsultasi', desc: 'Konsultasi gratis via WhatsApp sebelum pengerjaan.' },
  ]
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Mengapa Pilih Kami?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10">
                  <Icon className="size-6 text-green-600" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * CTASection — call to action untuk konsultasi WhatsApp.
 */
export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-green-600 to-green-800 py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Siap Upgrade Audio Mobil Anda?
        </h2>
        <p className="text-red-100 mb-6 max-w-2xl mx-auto">
          Konsultasi gratis dengan tim ahli kami. Dapatkan rekomendasi paket audio
          yang sesuai dengan kebutuhan dan budget mobil Anda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/6281295952279?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi%20audio%20mobil"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 text-sm transition-colors"
          >
            💬 Konsultasi WhatsApp
          </a>
          <a
            href="tel:081295952279"
            className="inline-flex items-center gap-2 rounded-md border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 text-sm transition-colors"
          >
            📞 0812-9595-2279
          </a>
        </div>
      </div>
    </section>
  )
}

/**
 * TestimoniSection — placeholder testimoni dari pelanggan.
 */
export function TestimoniSection() {
  const testimoni = [
    { name: 'Andi S.', car: 'Toyota Avanza', text: 'Hasil upgrade audio-nya sangat memuaskan. Vocal jernih, bass dalam, dan instalasi rapi. Recommended!', rating: 5 },
    { name: 'Budi H.', car: 'Honda Brio', text: 'DSP tuning-nya bikin suara speaker original jadi jauh lebih baik. Worth every penny!', rating: 5 },
    { name: 'Rizky P.', car: 'Mazda CX-5', text: 'Pelayanan profesional, konsultasi detail, dan hasil sesuai ekspektasi. Pasti balik lagi.', rating: 5 },
  ]
  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Testimoni Pelanggan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {testimoni.map((t, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="size-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-600/10 grid place-items-center text-xs font-bold text-green-600">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.car}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * SocialMediaSection — link ke social media Innovation Car Audio.
 */
export function SocialMediaSection() {
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Follow Innovation Car Audio
        </h2>
        <p className="text-muted-foreground mb-6">Ikuti update terbaru, tips audio, dan showcase instalasi di social media kami.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.instagram.com/innovationcar_audio/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">📷</span>
            <div className="text-left">
              <div className="text-sm font-semibold">Instagram</div>
              <div className="text-xs text-muted-foreground">@innovationcar_audio</div>
            </div>
          </a>
          <a
            href="https://www.youtube.com/@innovationcaraudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">📺</span>
            <div className="text-left">
              <div className="text-sm font-semibold">YouTube</div>
              <div className="text-xs text-muted-foreground">@innovationcaraudio</div>
            </div>
          </a>
          <a
            href="https://www.facebook.com/Innovationcaraudiojakartabarat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">📘</span>
            <div className="text-left">
              <div className="text-sm font-semibold">Facebook</div>
              <div className="text-xs text-muted-foreground">Innovation Car Audio Jakarta</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
