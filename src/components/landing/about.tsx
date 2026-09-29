/**
 * About section — section id="about".
 *
 * Innovation Car Audio Jakarta — workshop audio mobil & peredam suara
 * dengan pengalaman 20+ tahun. Spesialis upgrade audio mobil, DSP tuning,
 * instalasi speaker premium, dan peredam suara.
 */

export function About() {
  return (
    <section id="about" className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Tentang Innovation Car Audio
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Workshop Audio Mobil & Peredam Suara Terbaik Jakarta
          </p>
        </div>

        <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 leading-relaxed space-y-4">
          <p>
            <strong>Innovation Car Audio Jakarta</strong> adalah workshop spesialis upgrade audio mobil
            dan peredam suara yang telah melayani pelanggan di Jakarta dan Jabodetabek selama lebih dari
            20 tahun. Dengan pengalaman dan keahlian teknis yang mendalam, kami berkomitmen memberikan
            solusi audio mobil terbaik yang sesuai dengan kebutuhan dan budget setiap pelanggan.
          </p>
          <p>
            Kami menawarkan berbagai paket upgrade audio mulai dari <strong>Simple Upgrade</strong> untuk
            pengguna entry-level, <strong>Entry</strong> dengan komponen aftermarket, <strong>Daily Use</strong>
            untuk penggunaan harian dengan kualitas premium, hingga <strong>Affordable High End</strong>
            untuk audiophile yang menginginkan kualitas suara terbaik. Setiap paket dilengkapi dengan
            DSP tuning profesional, instalasi rapi, dan garansi pengerjaan.
          </p>
          <p>
            Sebagai authorized dealer dari brand-brand premium seperti <strong>Rainbow, GZ Mercy, Blam,
            PHD, Infinity, Morel,</strong> dan <strong>Prototype Quarto</strong>, kami memastikan semua
            komponen yang dipasang adalah 100% original dengan garansi resmi. Tim teknisi kami juga
            berpengalaman dalam instalasi peredam suara (soundproofing) untuk mendukung kualitas audio
            yang optimal di dalam kabin kendaraan.
          </p>
        </div>

        {/* Feature badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            '20+ Tahun Pengalaman',
            '100% Original Parts',
            'DSP Tuning Profesional',
            'Garansi Pengerjaan',
            'Free Konsultasi',
          ].map((badge, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300"
            >
              ✓ {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
