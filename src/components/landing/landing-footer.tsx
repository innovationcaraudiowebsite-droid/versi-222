import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Clock } from 'lucide-react'

/**
 * LandingFooter — multi-column footer untuk Innovation Car Audio Jakarta.
 *
 * Columns: Brand info | Layanan | Kontak | Social Media
 * Background: dark (bg-slate-950)
 * Brand color: red accent
 */

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-auto">
      {/* Main footer content */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Innovation Car Audio
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Workshop audio mobil & peredam suara terbaik di Jakarta dengan pengalaman 20+ tahun. Spesialis upgrade audio, DSP tuning, dan instalasi speaker premium.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="size-3.5" />
              <span>Senin–Sabtu: 09:00–18:00</span>
            </div>
          </div>

          {/* Column 2: Layanan */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Layanan</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#paket" className="text-slate-400 hover:text-green-500 transition-colors">Paket Audio Mobil</a></li>
              <li><a href="/#edukasi" className="text-slate-400 hover:text-green-500 transition-colors">Jenis Bahan Peredam</a></li>
              <li><a href="/produk/simple-upgrade-basic" className="text-slate-400 hover:text-green-500 transition-colors">Simple Upgrade</a></li>
              <li><a href="/produk/entry-2way-sub-bawah-jok-basic" className="text-slate-400 hover:text-green-500 transition-colors">Entry Package</a></li>
              <li><a href="/produk/daily-use-2way-sub-bawah-jok-basic" className="text-slate-400 hover:text-green-500 transition-colors">Daily Use</a></li>
              <li><a href="/produk/affordable-high-end-2way-sub-bawah-jok-basic" className="text-slate-400 hover:text-green-500 transition-colors">Affordable High End</a></li>
              <li><a href="/#artikel" className="text-slate-400 hover:text-green-500 transition-colors">Artikel & Tips</a></li>
            </ul>
          </div>

          {/* Column 3: Kontak */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-slate-400">Jl. Taman Surya Blvd 3 Blok H1 No.9, Kalideres, Jakarta Barat 11830</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-green-500 shrink-0" />
                <a href="tel:081295952279" className="text-slate-400 hover:text-green-500 transition-colors">0812-9595-2279</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-green-500 shrink-0" />
                <a href="tel:082211222989" className="text-slate-400 hover:text-green-500 transition-colors">0822-1122-2989</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-green-500 shrink-0" />
                <a href="mailto:innovationcaraudio@gmail.com" className="text-slate-400 hover:text-green-500 transition-colors">innovationcaraudio@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Follow Us</h4>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/innovationcar_audio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-10 rounded-lg bg-slate-800 hover:bg-green-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-5 text-slate-300" />
              </a>
              <a
                href="https://www.facebook.com/Innovationcaraudiojakartabarat/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-10 rounded-lg bg-slate-800 hover:bg-green-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-5 text-slate-300" />
              </a>
              <a
                href="https://www.youtube.com/@innovationcaraudio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-10 rounded-lg bg-slate-800 hover:bg-green-600 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="size-5 text-slate-300" />
              </a>
            </div>
            <div className="pt-3">
              <a
                href="https://wa.me/6281295952279?text=Halo%20Innovation%20Car%20Audio%2C%20saya%20ingin%20konsultasi%20audio%20mobil"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 transition-colors"
              >
                <Phone className="size-4" />
                Konsultasi WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Innovation Car Audio Jakarta. All rights reserved.</p>
          <p>Workshop Audio Mobil & Peredam Suara — Jakarta Barat</p>
        </div>
      </div>
    </footer>
  )
}
