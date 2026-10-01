import { Trophy, Award, Star, MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, PlayCircle, Play, HelpCircle, ChevronDown } from 'lucide-react'

// ============================================================
// Section: Brand Partners (#partners)
// ============================================================
export function BrandPartners() {
  const brands = [
    { name: 'Crescendo', logo: '/brand-logos/crescendo.png' },
    { name: 'PHD', logo: '/brand-logos/phd.png' },
    { name: 'Rainbow', logo: '/brand-logos/rainbow.png' },
    { name: 'GZ Audio', logo: '/brand-logos/gz.png' },
    { name: 'Blam', logo: '/brand-logos/blam.png' },
    { name: 'Eton', logo: '/brand-logos/eton.png' },
    { name: 'Infinity', logo: '/brand-logos/infinity.png' },
    { name: 'Harman', logo: '/brand-logos/harman.png' },
    { name: 'Flux', logo: '/brand-logos/flux.png' },
    { name: 'Recoil', logo: '/brand-logos/recoil.png' },
    { name: 'Emphaser', logo: '/brand-logos/emphaser.png' },
    { name: 'Reverb', logo: '/brand-logos/reverb.png' },
    { name: 'Goldhorn', logo: '/brand-logos/goldhorn.png' },
    { name: 'Zevox', logo: '/brand-logos/zevox.png' },
    { name: 'Gran Turismo', logo: '/brand-logos/gran-turismo.png' },
    { name: 'Silent Coat', logo: '/brand-logos/silent-coat.png' },
    { name: 'DL Audio Lab', logo: '/brand-logos/dl-audio-lab.png' },
  ]
  return (
    <section id="partners" className="bg-background py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Brand Partner Resmi
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Authorized dealer brand audio mobil & peredam premium
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand, i) => (
            <div key={i} className="flex items-center justify-center rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-16 max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Section: Awards & Championship (#awards)
// ============================================================
export function AwardsSection() {
  const awards = [
    { value: '559+', label: 'Piala Kontes Audio' },
    { value: 'MURI', label: 'SPL Recipient' },
    { value: 'EMMA', label: 'Asia Champion' },
    { value: 'USACI', label: 'Championship' },
    { value: 'Euro Star', label: 'Award' },
    { value: 'National', label: 'Champion' },
  ]
  const achievements = [
    'MURI SPL Recipient',
    'Asia Champion EMMA & USACI',
    'Juara Kontes Audio',
    'National Champion',
    'EURO STAR Award',
    'Asian Pro Cup EMMA',
    'Champion EMMA Asia',
    'Champion of the Year EMMA',
    'King of Sound Indonesia',
    'EMMA Best Sound Quality from IHEAC',
  ]
  return (
    <section id="awards" className="bg-gradient-to-r from-gold to-gold-dark py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Award & Championship
        </h2>
        <p className="text-center text-gold/30 text-sm mb-8">
          Track Record 559+ Piala — Bukti Komitmen Kualitas
        </p>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {awards.map((a, i) => (
            <div key={i} className="flex flex-col items-center text-center rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Trophy className="size-8 mb-2" style={{ color: '#d4af37' }} />
              <div className="text-xl font-bold text-white">{a.value}</div>
              <div className="text-xs text-gold/30 mt-1">{a.label}</div>
            </div>
          ))}
        </div>
        {/* Achievement list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 max-w-5xl mx-auto">
          {achievements.map((ach, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <Award className="size-4 shrink-0" style={{ color: '#d4af37' }} />
              <span className="text-xs text-green-50">{ach}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Section: Video Showcase (#video)
// ============================================================
export function VideoSection() {
  const slides = [
    { src: '/gallery/slide-1.png', alt: 'Instalasi Audio Mobil 1' },
    { src: '/gallery/slide-2.png', alt: 'Instalasi Audio Mobil 2' },
    { src: '/gallery/slide-3.png', alt: 'Instalasi Audio Mobil 3' },
    { src: '/gallery/slide-4.png', alt: 'Instalasi Audio Mobil 4' },
  ]
  const bawahslides = [
    { src: '/gallery/bawahslide-1.png', alt: 'Dokumentasi workshop Innovation Car Audio 1' },
    { src: '/gallery/bawahslide-2.png', alt: 'Dokumentasi workshop Innovation Car Audio 2' },
    { src: '/gallery/bawahslide-3.png', alt: 'Dokumentasi workshop Innovation Car Audio 3' },
    { src: '/gallery/bawahslide-4.png', alt: 'Dokumentasi workshop Innovation Car Audio 4' },
    { src: '/gallery/bawahslide-5.png', alt: 'Dokumentasi workshop Innovation Car Audio 5' },
  ]
  return (
    <section id="video" className="py-16 bg-background border-t border-gold/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-wider text-gold mb-4">
            <PlayCircle className="h-3 w-3" />
            Video Gallery
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Workshop <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">Documentation</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Galeri dokumentasi instalasi &amp; testimoni pelanggan Innovation Car Audio.
          </p>
        </div>

        {/* 4 Slide images — grid 2x2 (md:4 cols) with play button */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              className="group relative aspect-video overflow-hidden rounded-lg border border-gold/20 bg-card/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/90 group-hover:bg-gold transition-all group-hover:scale-110">
                  <Play className="h-5 w-5 fill-black text-black" />
                </div>
              </div>
              {/* Label */}
              <div className="absolute bottom-2 left-3 right-3 text-left">
                <div className="text-xs font-semibold text-white">{slide.alt}</div>
              </div>
            </button>
          ))}
        </div>

        {/* 5 Bawahslide images — grid (md:5 cols) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {bawahslides.map((slide, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gold/10 bg-card/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <div className="text-[10px] text-white/80">{slide.alt.replace('Dokumentasi workshop Innovation Car Audio ', 'Dokumentasi ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Section: Recommender (#recommender)
// ============================================================
export function RecommenderSection() {
  return (
    <section id="recommender" className="bg-background py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Product Matchmaking
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Bingung pilih paket audio? Jawab beberapa pertanyaan dan kami rekomendasikan paket yang tepat untuk Anda.
        </p>
        <a
          href="https://wa.me/6281295952279?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20butuh%20rekomendasi%20paket%20audio%20mobil"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
        >
          Mulai Konsultasi Gratis
        </a>
      </div>
    </section>
  )
}

// ============================================================
// Section: Area Servis Jabodetabek (#area-jabodetabek)
// ============================================================
export function AreaServisSection() {
  const areas = [
    'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara', 'Jakarta Pusat',
    'Tangerang', 'Tangerang Selatan', 'Bekasi', 'Depok', 'Bogor',
    'BSD', 'Bintaro', 'Cibubur', 'Gading Serpong', 'Alam Sutera',
  ]
  return (
    <section id="area-jabodetabek" className="bg-muted/30 py-12 sm:py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Area Servis
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Melayani instalasi audio & peredam di Jakarta dan sekitarnya
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {areas.map((area, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 dark:border-gold/40 bg-card px-3 py-1.5 text-xs font-medium text-foreground/80">
              <MapPin className="size-3 text-gold" />
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Section: Lokasi & Kontak (#lokasi)
// ============================================================
export function LokasiSection() {
  return (
    <section id="lokasi" className="bg-background py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Workshop Jakarta Barat
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gold/30 bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Alamat Workshop</h3>
                  <p className="text-sm text-muted-foreground mt-1">Jl. Taman Surya Blvd 3 Blok H1 No.9, Kalideres, Jakarta Barat 11830</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Kontak WhatsApp</h3>
                  <p className="text-sm text-muted-foreground mt-1 space-y-1">
                    <a href="https://wa.me/6282211222989" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">Sales 1: +62 822-1122-2989</a>
                    <a href="https://wa.me/6281295952279" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">Sales 2: +62 812-9595-2279</a>
                    <a href="https://wa.me/6281398882289" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">Technical Support: +62 813-9888-2289</a>
                    <a href="https://wa.me/6281295958999" target="_blank" rel="noopener noreferrer" className="block hover:text-gold transition-colors">Kritik, Saran & Mobil Kontes: +62 812-9595-8999</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="size-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href="mailto:innovationcaraudio@gmail.com" className="hover:text-gold transition-colors">innovationcaraudio@gmail.com</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="size-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Jam Operasional</h3>
                  <p className="text-sm text-muted-foreground mt-1">Senin–Sabtu: 09:00–18:00<br />Minggu: Tutup</p>
                </div>
              </div>
            </div>
            {/* Social + Marketplace */}
            <div className="flex flex-wrap gap-3">
              <a href="https://www.instagram.com/innovationcar_audio/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 rounded-lg bg-card border border-border hover:bg-gold hover:text-black transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="https://www.facebook.com/Innovationcaraudiojakartabarat/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 rounded-lg bg-card border border-border hover:bg-gold hover:text-black transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="https://www.youtube.com/@innovationcaraudio" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 rounded-lg bg-card border border-border hover:bg-gold hover:text-black transition-colors">
                <Youtube className="size-5" />
              </a>
              <a href="https://www.tokopedia.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 hover:bg-gold hover:text-black transition-colors h-12 text-xs font-medium">
                🛒 Tokopedia
              </a>
              <a href="https://shopee.co.id/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 hover:bg-gold hover:text-black transition-colors h-12 text-xs font-medium">
                🛒 Shopee
              </a>
            </div>
          </div>
          {/* Map */}
          <div className="rounded-xl border border-gold/30 bg-card overflow-hidden min-h-[300px]">
            <a
              href="https://www.google.com/maps?q=Innovation+Car+Audio+Kalideres+Jakarta+Barat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-full min-h-[300px] hover:bg-muted/30 transition-colors"
            >
              <div className="text-center">
                <MapPin className="size-12 text-gold/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Buka di Google Maps</p>
                <p className="text-xs text-muted-foreground mt-1">Innovation Car Audio, Kalideres, Jakarta Barat</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Section: FAQ (#faq)
// ============================================================
export function FAQSection() {
  const faqs = [
    { q: 'Berapa lama waktu instalasi audio mobil di Innovation Car Audio?', a: 'Waktu instalasi bervariasi tergantung paket. Simple Upgrade sekitar 4-6 jam, Entry 6-8 jam, Daily Use 8-10 jam, dan Affordable High End 10-12 jam termasuk DSP tuning. Semua pengerjaan dilakukan di workshop kami di Jakarta Barat.' },
    { q: 'Apakah melayani pelanggan dari Bekasi, Tangerang, Bogor, dan Depok?', a: 'Ya, Innovation Car Audio melayani seluruh area Jabodetabek. Kami melayani Jakarta Barat, Pusat, Selatan, Timur, Utara, Tangerang, Bekasi, Depok, dan Bogor.' },
    { q: 'Berapa harga paket audio mobil di Innovation Car Audio?', a: 'Kami menyediakan 4 kategori paket audio: Simple Upgrade (Rp 3.3jt - 9.3jt), Entry (Rp 10jt - 26.6jt), Daily Use (Rp 21.7jt - 54jt), dan Affordable High End (Rp 31jt - 80jt). Total 84 varian paket tersedia.' },
    { q: 'Apakah peredam suara mobil penting untuk upgrade audio?', a: 'Sangat penting. Peredam Gran Turismo (3 lembar) sudah included di setiap paket. Peredam mengurangi resonansi panel, meningkatkan midbass speaker, dan menciptakan quiet cabin untuk audio optimal.' },
    { q: 'Apakah Innovation Car Audio pernah menang kontes audio?', a: 'Ya, kami memiliki track record 559+ piala kontes audio. MURI SPL Recipient, Asia Champion EMMA & USACI, National Champion, EURO STAR Award, King of Sound Indonesia, dan banyak lagi.' },
    { q: 'Brand speaker apa saja yang tersedia?', a: 'Kami adalah authorized dealer dari 17 brand premium: Crescendo, PHD, Rainbow, GZ Audio, Blam, Eton, Infinity, Harman, Flux, Recoil, Emphaser, Reverb, Goldhorn, Zevox, Gran Turismo, Silent Coat, dan DL Audio Lab. Semua 100% original.' },
    { q: 'Apakah ada garansi untuk instalasi audio mobil?', a: 'Ya, semua paket include garansi pengerjaan. Free follow-up tuning 1 bulan setelah instalasi untuk penyesuaian setelah break-in period. Garansi komponen sesuai ketentuan brand.' },
    { q: 'Bagaimana cara booking atau konsultasi audio mobil?', a: 'WhatsApp kami di 0812-9595-2279 atau 0822-1122-2989 untuk konsultasi gratis. Bisa juga datang langsung ke workshop di Jl. Taman Surya Blvd 3, Kalideres, Jakarta Barat.' },
    { q: 'Apakah speaker original bisa dipakai untuk upgrade?', a: 'Bisa. Paket Simple Upgrade dirancang khusus untuk mempertahankan speaker original dengan menambahkan DSP Rainbow, Power Mono, dan Subwoofer. DSP tuning akan membuat speaker original terdengar jauh lebih baik.' },
  ]
  return (
    <section id="faq" className="bg-muted/30 py-12 sm:py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          FAQ
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-lg border border-border bg-card p-4">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground">
                {faq.q}
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Section: Testimoni (#testimoni) — updated
// ============================================================
export function TestimoniSection() {
  const testimoni = [
    { name: 'Andi S.', car: 'Toyota Avanza', text: 'Hasil upgrade audio-nya sangat memuaskan. Vocal jernih, bass dalam, dan instalasi rapi. 559 piala bukan cuma omong kosong!', rating: 5 },
    { name: 'Budi H.', car: 'Honda Brio', text: 'DSP tuning-nya bikin suara speaker original jadi jauh lebih baik. Worth every rupiah! Recommended banget.', rating: 5 },
    { name: 'Rizky P.', car: 'Mazda CX-5', text: 'Pelayanan profesional, konsultasi detail, dan hasil sesuai ekspektasi. Champion EMMA Asia emang terbukti.', rating: 5 },
  ]
  return (
    <section id="testimoni" className="bg-background py-12 sm:py-16">
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
                <div className="h-8 w-8 rounded-full bg-gold/10 grid place-items-center text-xs font-bold text-gold">
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
