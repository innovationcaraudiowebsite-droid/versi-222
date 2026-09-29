import { Trophy, Award, Star, MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, PlayCircle, HelpCircle, ChevronDown } from 'lucide-react'

// ============================================================
// Section: Brand Partners (#partners)
// ============================================================
export function BrandPartners() {
  const brands = [
    'Crescendo', 'PHD', 'Rainbow', 'GZ Audio', 'Blam', 'Eton',
    'Infinity', 'Harman', 'Flux', 'Recoil', 'Emphaser', 'Reverb',
    'Goldhorn', 'Zevox', 'Gran Turismo', 'Silent Coat', 'DL Audio Lab', 'Prototype Quarto',
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
            <div key={i} className="flex items-center justify-center rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
              <span className="text-sm font-bold text-foreground/80 text-center">{brand}</span>
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
    <section id="awards" className="bg-gradient-to-r from-green-700 to-green-900 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Award & Championship
        </h2>
        <p className="text-center text-green-100 text-sm mb-8">
          Track Record 559+ Piala — Bukti Komitmen Kualitas
        </p>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {awards.map((a, i) => (
            <div key={i} className="flex flex-col items-center text-center rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Trophy className="size-8 mb-2" style={{ color: '#d4af37' }} />
              <div className="text-xl font-bold text-white">{a.value}</div>
              <div className="text-xs text-green-100 mt-1">{a.label}</div>
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
  return (
    <section id="video" className="bg-muted/30 py-12 sm:py-16">
      <div className="container mx-auto max-w-5xl px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
          Galeri Instalasi & Workshop
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Lihat proses instalasi audio mobil & peredam suara di workshop kami
        </p>
        <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-card">
          <a
            href="https://www.youtube.com/@innovationcaraudio"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-600/20 to-green-900/40 hover:from-green-600/30 hover:to-green-900/50 transition-colors"
          >
            <div className="flex flex-col items-center gap-3">
              <PlayCircle className="size-16 text-white/80 hover:text-white transition-colors" />
              <span className="text-white font-medium text-sm">Kunjungi Channel YouTube Kami</span>
            </div>
          </a>
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
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 text-sm transition-colors"
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
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-800 bg-card px-3 py-1.5 text-xs font-medium text-foreground/80">
              <MapPin className="size-3 text-green-600" />
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
          Kontak & Lokasi
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Alamat Workshop</h3>
                  <p className="text-sm text-muted-foreground mt-1">Jl. Taman Surya Blvd 3 Blok H1 No.9, Kalideres, Jakarta Barat 11830</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Telepon & WhatsApp</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href="tel:081295952279" className="hover:text-green-600">0812-9595-2279</a><br />
                    <a href="tel:082211222989" className="hover:text-green-600">0822-1122-2989</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="size-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href="mailto:innovationcaraudio@gmail.com" className="hover:text-green-600">innovationcaraudio@gmail.com</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="size-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Jam Operasional</h3>
                  <p className="text-sm text-muted-foreground mt-1">Senin–Sabtu: 09:00–18:00<br />Minggu: Tutup</p>
                </div>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3">
              <a href="https://www.instagram.com/innovationcar_audio/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 rounded-lg bg-card border border-border hover:bg-green-600 hover:text-white transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="https://www.facebook.com/Innovationcaraudiojakartabarat/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 rounded-lg bg-card border border-border hover:bg-green-600 hover:text-white transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="https://www.youtube.com/@innovationcaraudio" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 rounded-lg bg-card border border-border hover:bg-green-600 hover:text-white transition-colors">
                <Youtube className="size-5" />
              </a>
            </div>
          </div>
          {/* Map placeholder */}
          <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="size-12 text-green-600/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Google Maps Integration</p>
              <p className="text-xs text-muted-foreground mt-1">Kalideres, Jakarta Barat</p>
            </div>
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
    { q: 'Berapa lama proses instalasi audio mobil?', a: 'Waktu instalasi bervariasi tergantung paket. Simple Upgrade sekitar 4-6 jam, Entry 6-8 jam, Daily Use 8-10 jam, dan Affordable High End 10-12 jam termasuk DSP tuning.' },
    { q: 'Apakah semua komponen original?', a: 'Ya, Innovation Car Audio adalah authorized dealer dari brand-brand premium seperti Rainbow, GZ Mercy, Blam, PHD, Infinity, Morel, dan Prototype Quarto. Semua komponen 100% original dengan garansi resmi.' },
    { q: 'Apakah ada garansi pengerjaan?', a: 'Ya, semua paket audio include garansi pengerjaan. Selain itu, kami juga menyediakan free follow-up tuning 1 bulan setelah instalasi untuk penyesuaian setelah break-in period.' },
    { q: 'Bagaimana cara booking atau konsultasi audio mobil?', a: 'Anda bisa langsung WhatsApp kami di 0812-9595-2279 atau 0822-1122-2989 untuk konsultasi gratis. Tim kami akan membantu menentukan paket yang sesuai dengan kebutuhan dan budget Anda.' },
    { q: 'Apakah melayani area luar Jakarta?', a: 'Ya, kami melayani area Jabodetabek termasuk Jakarta Barat, Selatan, Timur, Utara, Pusat, Tangerang, Bekasi, Depok, dan Bogor.' },
    { q: 'Apakah peredam suara wajib saat upgrade audio?', a: 'Peredam Gran Turismo (3 lembar) sudah included di setiap paket audio. Peredam penting untuk mengurangi resonansi panel dan meningkatkan kualitas midbass speaker.' },
    { q: 'Speaker original bisa dipakai untuk upgrade?', a: 'Bisa. Paket Simple Upgrade dirancang khusus untuk mempertahankan speaker original dengan menambahkan DSP, Power, dan Subwoofer. DSP tuning akan membuat speaker original terdengar jauh lebih baik.' },
    { q: 'Apa perbedaan DSP 6CH, 8CH, dan 10CH?', a: 'DSP 6CH untuk speaker pasif (Basic & Normal tier), DSP 8CH untuk speaker aktif 2-way (Best Buy & Recommended), dan DSP 10CH untuk sistem lengkap dengan Front + Rear + Subwoofer aktif.' },
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
