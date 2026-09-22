/**
 * seed-mock-products.ts
 *
 * Generate 5 produk parent + 15 ProductVariant (3 varian per produk).
 * Setiap varian punya 4+ gallery images untuk mini carousel di card.
 *
 * Output: update data/backup-sqlite.json dengan mock data.
 *
 * Tier distribution per produk:
 *  - Variant 1: basic       (ribbon "BASIC", slate)
 *  - Variant 2: normal      (ribbon "POPULAR", blue)
 *  - Variant 3: best_buy    (ribbon "BEST BUY", amber) ATAU recommended (emerald)
 *
 * Produk 1 & 3: varian 3 = best_buy (amber)
 * Produk 2 & 5: varian 3 = recommended (emerald)
 * Produk 4: varian 3 = best_buy (amber) — Peredam Only pakai best_buy
 */

import fs from 'node:fs'
import path from 'node:path'

interface MockVariant {
  name: string
  tier: 'basic' | 'normal' | 'best_buy' | 'recommended'
  sortOrder: number
  price: string
  priceValue: number | null
  ribbonLabel: string
  ribbonColor: string
  cardTitle: string
  cardDescription: string
  galleryImages: string[]
  introMarkdown: string
  sections: unknown[]
  closingTagline: string
  closingComponents: string[]
}

interface MockProduct {
  name: string
  slug: string
  category: string
  shortDescription: string
  waNumber: string
  variants: MockVariant[]
}

// ============================================================
// Helper: buat gallery images dari Unsplash untuk mock.
// Pakai keyword berbeda per produk supaya gambar variatif.
// ============================================================
function gallery(keyword: string): string[] {
  // 4 gambar per varian dengan keyword unik
  // Pakai unsplash source URL yang di-allow di next.config.ts
  return [
    `https://images.unsplash.com/photo-1${hashKeyword(keyword, 1)}?w=800&q=80&auto=format&fit=crop`,
    `https://images.unsplash.com/photo-1${hashKeyword(keyword, 2)}?w=800&q=80&auto=format&fit=crop`,
    `https://images.unsplash.com/photo-1${hashKeyword(keyword, 3)}?w=800&q=80&auto=format&fit=crop`,
    `https://images.unsplash.com/photo-1${hashKeyword(keyword, 4)}?w=800&q=80&auto=format&fit=crop`,
  ]
}

// Deterministic hash dari keyword → angka untuk variasi image ID
function hashKeyword(kw: string, salt: number): string {
  let hash = salt * 1000
  for (let i = 0; i < kw.length; i++) {
    hash = (hash * 31 + kw.charCodeAt(i)) % 999999
  }
  return String(hash).padStart(12, '0')
}

// ============================================================
// MOCK DATA — 5 produk × 3 varian = 15 varian
// ============================================================
const MOCK_PRODUCTS: MockProduct[] = [
  // === PRODUK 1: Simple Upgrade (dari artikel 1) ===
  {
    name: 'Simple Upgrade',
    slug: 'simple-upgrade',
    category: 'Paket Upgrade Audio',
    shortDescription: 'Upgrade audio dengan speaker original tetap dipertahankan',
    waNumber: '6282211222399',
    variants: [
      {
        name: 'Basic',
        tier: 'basic',
        sortOrder: 1,
        price: 'Rp 3.500.000',
        priceValue: 3500000,
        ribbonLabel: 'BASIC',
        ribbonColor: 'slate',
        cardTitle: 'DSP + POWER ONLY',
        cardDescription: 'Upgrade dasar dengan DSP Rainbow + Power 4ch. Speaker original tetap dipakai.',
        galleryImages: gallery('simple-basic'),
        introMarkdown: 'Paket Basic dirancang untuk pengguna yang ingin upgrade audio minimal dengan DSP processing. Speaker original tetap dipertahankan untuk menjaga biaya tetap rendah.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'list',
            items: ['DSP — Rainbow EL-PA4.6', 'Power 4ch — Prototype Quarto', 'Speaker Front — Original', 'Speaker Rear — Original']
          },
          {
            title: 'B. KABEL & MATERIAL',
            type: 'list',
            items: ['Kabel aki & ground 8 AWG', 'Fuse Box ANL 1 line', 'Kabel speaker 16 AWG', 'RCA SQ 2,5m', 'Kabel remote']
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: ['Jasa instalasi', 'Phase checker', 'Setting & tuning DSP dasar']
          }
        ],
        closingTagline: 'Basic Upgrade — Speaker Original + DSP Processing',
        closingComponents: ['Rainbow DSP EL-PA4.6', 'Prototype Quarto Power 4ch']
      },
      {
        name: 'Normal',
        tier: 'normal',
        sortOrder: 2,
        price: 'Rp 4.800.000',
        priceValue: 4800000,
        ribbonLabel: 'POPULAR',
        ribbonColor: 'blue',
        cardTitle: 'DSP + POWER + SUB 8"',
        cardDescription: 'Tambah subwoofer 8" untuk bass lebih dalam. Speaker original + DSP + Power + Sub.',
        galleryImages: gallery('simple-normal'),
        introMarkdown: 'Paket Normal menambahkan subwoofer 8" untuk melengkapi frekuensi rendah yang tidak bisa dihasilkan speaker original. DSP Rainbow memberikan kontrol penuh sistem.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'list',
            items: ['DSP — Rainbow EL-PA4.6', 'Power Mono — Prototype Quarto', 'Subwoofer 8" — Prototype Quarto', 'Speaker Front — Original', 'Speaker Rear — Original']
          },
          {
            title: 'B. KABEL, PILAR & BOX',
            type: 'list',
            items: ['Box kayu simple', 'Kabel aki & ground 8 AWG', 'Kabel speaker 16 AWG', 'Kabel subwoofer 16 AWG', 'RCA SQ 2,5m', 'Fuse Box ANL 1 line', 'Kabel remote']
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: ['Jasa instalasi', 'Phase checker', 'Dudukan fuse box', 'Klem kabel + solder', 'Sealer kabel', 'Setting & tuning DSP']
          }
        ],
        closingTagline: 'Normal Upgrade — DSP + Power + Subwoofer 8"',
        closingComponents: ['Rainbow DSP EL-PA4.6', 'Prototype Quarto Power Mono', 'Subwoofer 8" Prototype Quarto']
      },
      {
        name: 'Best Buy',
        tier: 'best_buy',
        sortOrder: 3,
        price: 'Rp 6.500.000',
        priceValue: 6500000,
        ribbonLabel: 'BEST BUY',
        ribbonColor: 'amber',
        cardTitle: 'DSP + CONTROLLER + SUB 10"',
        cardDescription: 'Paket lengkap dengan DSP Controller + Power Mono + Sub 10" Prototype Quarto. Upgrade signifikan tanpa rombak total.',
        galleryImages: gallery('simple-best-buy'),
        introMarkdown: 'Simple Upgrade – Best Buy dirancang untuk pengguna yang menginginkan peningkatan sistem audio yang lebih lengkap, dengan tetap mempertahankan speaker Front dan Rear original kendaraan.\n\nPaket ini menggabungkan DSP Rainbow EL-PA4.6 + Controller, Power Mono Prototype Quarto, dan Subwoofer 10" Prototype Quarto untuk membangun sistem yang memiliki kontrol suara lebih baik sekaligus tambahan tenaga dan karakter bass yang lebih kuat.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'subsections',
            subsections: [
              { title: 'DSP — Rainbow EL-PA4.6', subtitle: '+ Controller', markdown: 'DSP Rainbow memberikan fleksibilitas pengolahan sinyal dan tuning sistem. Speaker original tetap digunakan, kemudian karakter suara dapat dioptimalkan melalui DSP agar lebih seimbang, fokus, dan terkontrol.' },
              { title: 'Power Mono — Prototype Quarto', markdown: 'Power mono secara khusus menangani subwoofer sehingga kebutuhan reproduksi frekuensi rendah dapat bekerja dengan lebih optimal.' },
              { title: 'Subwoofer 10" — Prototype Quarto', markdown: 'Subwoofer 10" memberikan tambahan bass yang lebih terasa dan memiliki impact lebih kuat, sekaligus membantu speaker original bekerja lebih ringan pada reproduksi frekuensi rendah.' }
            ]
          },
          {
            title: 'B. KABEL, PILAR & BOX',
            type: 'list',
            items: ['Box kayu simple', 'Kabel aki & ground 8 AWG', 'Kabel speaker input & output 16 AWG', 'Kabel subwoofer 16 AWG', 'Kabel input DSP 16 AWG', 'RCA SQ 2,5 m', 'Fuse Box ANL jepit 1 line', 'Fuse Box ANL jepit 2 line', 'Kabel remote']
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: ['Jasa instalasi', 'Phase checker', 'Selang flexible kabel aki ruang mesin', 'Dudukan fuse box', 'Klem kabel + solder + selang bakar', 'Sealer kabel', 'Proteksi tarikan pintu & kisi AC', 'Penutup cover stir', 'Wrapping perlindungan jok & interior', 'Setting & tuning DSP']
          },
          {
            title: 'DSP TUNING & SYSTEM INTEGRATION',
            type: 'markdown',
            markdown: 'Setelah seluruh perangkat terpasang, sistem akan melalui proses setting dan tuning. DSP digunakan untuk membantu mengintegrasikan speaker original dengan sistem subwoofer sehingga transisi antara suara depan dan frekuensi rendah dapat terdengar lebih menyatu. Tuning dilakukan dengan memperhatikan keseimbangan tonal, staging, imaging, karakter vokal, serta integrasi bass.'
          },
          {
            title: 'D. OPTIONAL',
            type: 'list',
            items: ['Peredam Gran Turismo', 'Panel Controller', 'Dek dasar + Panel DSP']
          }
        ],
        closingTagline: 'BEST BUY — Complete Upgrade, Original Speaker Retained',
        closingComponents: ['Rainbow DSP EL-PA4.6 + Controller', 'Prototype Quarto Power Mono', 'Subwoofer 10" Prototype Quarto']
      }
    ]
  },

  // === PRODUK 2: 2 Way Upgrade (dari artikel 2) ===
  {
    name: '2 Way Upgrade Audio',
    slug: '2-way-upgrade-audio',
    category: 'Paket Upgrade Audio',
    shortDescription: 'Speaker 2 Way + DSP + Subwoofer untuk kualitas suara detail',
    waNumber: '6282211222399',
    variants: [
      {
        name: 'Basic',
        tier: 'basic',
        sortOrder: 1,
        price: 'Rp 4.200.000',
        priceValue: 4200000,
        ribbonLabel: 'BASIC',
        ribbonColor: 'slate',
        cardTitle: '2 WAY + DSP ONLY',
        cardDescription: 'Speaker 2 Way aftermarket + DSP Rainbow. Tanpa subwoofer, fokus vocal clarity.',
        galleryImages: gallery('2way-basic'),
        introMarkdown: 'Paket Basic 2 Way Upgrade cocok untuk pengguna yang ingin speaker aftermarket dengan DSP processing, tanpa penambahan subwoofer.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'list',
            items: ['Speaker Front 2 Way — Aftermarket', 'DSP — Rainbow EL-PA4.6', 'Kontroler DSP — Rainbow EL-PA4.6']
          },
          { title: 'B. KABEL & MATERIAL', type: 'list', items: ['Kabel aki & ground 8 AWG', 'Kabel speaker 16 AWG', 'RCA SQ 2,5m', 'Fuse Box ANL 1 line'] },
          { title: 'C. JASA INSTALASI & TUNING', type: 'list', items: ['Jasa instalasi', 'Phase checker', 'Setting & tuning DSP'] }
        ],
        closingTagline: 'Basic 2 Way — Speaker Aftermarket + DSP',
        closingComponents: ['Speaker 2 Way Aftermarket', 'Rainbow DSP EL-PA4.6']
      },
      {
        name: 'Normal',
        tier: 'normal',
        sortOrder: 2,
        price: 'Rp 5.500.000',
        priceValue: 5500000,
        ribbonLabel: 'POPULAR',
        ribbonColor: 'blue',
        cardTitle: '2 WAY + DSP + SUB 8" ENTRY',
        cardDescription: 'Tambah subwoofer 8" entry level untuk bass tambahan. Combo seimbang untuk daily use.',
        galleryImages: gallery('2way-normal'),
        introMarkdown: 'Paket Normal 2 Way Upgrade menambahkan subwoofer 8" entry level untuk melengkapi frekuensi rendah. DSP Rainbow memberikan kontrol penuh sistem.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'list',
            items: ['Speaker Front 2 Way — Aftermarket', 'DSP — Rainbow EL-PA4.6', 'Power Mono — Entry Level', 'Subwoofer 8" — Entry Level']
          },
          { title: 'B. KABEL, PILAR & BOX', type: 'list', items: ['Box kayu simple', 'Kabel aki 8 AWG', 'Kabel speaker 16 AWG', 'RCA SQ 2,5m', 'Fuse Box ANL 1 line'] },
          { title: 'C. JASA INSTALASI & TUNING', type: 'list', items: ['Jasa instalasi', 'Phase checker', 'Setting & tuning DSP'] }
        ],
        closingTagline: 'Normal 2 Way — Speaker + DSP + Subwoofer 8"',
        closingComponents: ['Speaker 2 Way Aftermarket', 'Rainbow DSP EL-PA4.6', 'Subwoofer 8" Entry Level']
      },
      {
        name: 'Recommended',
        tier: 'recommended',
        sortOrder: 3,
        price: 'Rp 7.800.000',
        priceValue: 7800000,
        ribbonLabel: 'RECOMMENDED',
        ribbonColor: 'emerald',
        cardTitle: 'PHD 6.1 + DSP + SUB 8" + CNC',
        cardDescription: 'PHD MF 6.1 KIT 2 Way + DSP Rainbow + Subwoofer 8" Zevox + Jaring CNC Midrange. Konfigurasi lengkap.',
        galleryImages: gallery('2way-recommended'),
        introMarkdown: 'Paket Recommended ini merupakan konfigurasi upgrade audio yang dirancang untuk pengguna yang menginginkan kualitas suara lebih detail, seimbang, dan memiliki karakter yang lebih lengkap.\n\nMenggunakan PHD MF 6.1 KIT 2 Way 6.5" Pasif, dipadukan dengan DSP Rainbow EL-PA4.6 dan Subwoofer 8" Zevox ZV 8 SAS.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'subsections',
            subsections: [
              { title: '1. PHD MF 6.1 KIT', subtitle: '2 Way 6.5" Pasif', markdown: 'Konfigurasi 2 Way dirancang untuk menghasilkan reproduksi vocal yang lebih jelas, detail musik yang lebih terbuka, serta midbass yang lebih solid. Dengan pengolahan DSP, karakter speaker dapat disesuaikan dengan kondisi akustik kendaraan.' },
              { title: 'Jaring CNC Midrange', markdown: 'Dilengkapi Jaring CNC Midrange sebagai bagian pendukung instalasi speaker untuk memberikan tampilan yang lebih rapi dan presisi.' },
              { title: '2. DSP Rainbow EL-PA4.6', markdown: 'DSP berfungsi sebagai pusat pengolahan dan tuning seluruh sistem audio. Parameter: Crossover, Level/Gain, Equalizer, Phase, Time Alignment, Staging, Imaging, Integrasi Front/Rear/Subwoofer.' },
              { title: '3. Kontroler DSP Rainbow EL-PA4.6', markdown: 'Kontroler digunakan untuk memudahkan pengoperasian serta pengaturan DSP sesuai kebutuhan sistem.' },
              { title: '4. Subwoofer 8" Zevox ZV 8 SAS', markdown: 'Subwoofer 8" berfungsi melengkapi reproduksi frekuensi rendah yang tidak dapat dihasilkan secara optimal oleh speaker 2 Way. Memberikan bass yang lebih dalam, berisi, dan terkontrol.' }
            ]
          },
          {
            title: 'KONFIGURASI CHANNEL DSP',
            type: 'subsections',
            subsections: [
              { title: 'DSP 6 Channel', markdown: 'Front: ON, Rear: OFF, Sub: ON — Sistem Front + Subwoofer' },
              { title: 'DSP 8 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON — Front + Rear + Subwoofer aktif' },
              { title: 'DSP 10 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON — Konfigurasi penuh dengan fleksibilitas maksimal' }
            ]
          },
          {
            title: 'B. KABEL, PILAR & BOX',
            type: 'list',
            items: ['Dek dasar subwoofer', 'Kabel aki & ground 8 AWG', 'Fuse Box ANL jepit 1 line', 'Fuse Box ANL jepit 2 line', 'Kabel remote', 'Kabel speaker Front 16 AWG', 'Kabel input DSP 16 AWG', 'RCA SQ 2,5 meter', 'Peredam Gran Turismo']
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: ['Jasa instalasi', 'Phase checker', 'Selang flexible kabel aki ruang mesin', 'Ring midbass + finishing cat', 'Pembesaran plat + anti karat', 'Dudukan fuse box', 'Klem kabel + solder + selang bakar', 'Sealer kabel', 'Plakban jalur tarikan pintu & kisi AC', 'Penutup cover stir', 'Wrapping plastik untuk jok & interior', 'Jasa setting DSP']
          },
          {
            title: 'TARGET HASIL SUARA',
            type: 'list',
            items: ['Vocal lebih jelas dan natural', 'Detail musik lebih terbuka', 'Midbass lebih solid', 'Tonal balance lebih seimbang', 'Bass lebih dalam dan terkontrol', 'Staging lebih luas', 'Imaging lebih fokus', 'Distribusi suara lebih merata', 'Integrasi Front, Rear & Subwoofer lebih menyatu', 'Karakter suara nyaman untuk penggunaan harian']
          }
        ],
        closingTagline: 'RECOMMENDED — PHD MF 6.1 KIT + DSP + SUBWOOFER 8"',
        closingComponents: ['PHD MF 6.1 KIT', 'Rainbow DSP EL-PA4.6', 'Zevox ZV 8 SAS', 'Jaring CNC Midrange']
      }
    ]
  },

  // === PRODUK 3: Full Upgrade Audio ===
  {
    name: 'Full Upgrade Audio',
    slug: 'full-upgrade-audio',
    category: 'Paket Upgrade Audio',
    shortDescription: 'Full sistem upgrade dengan speaker aftermarket premium + power + sub',
    waNumber: '6282211222399',
    variants: [
      {
        name: 'Basic',
        tier: 'basic',
        sortOrder: 1,
        price: 'Rp 5.000.000',
        priceValue: 5000000,
        ribbonLabel: 'BASIC',
        ribbonColor: 'slate',
        cardTitle: 'SPEAKER PREMIUM + DSP',
        cardDescription: 'Speaker aftermarket entry + DSP Rainbow. Tanpa power tambahan, fokus clarity.',
        galleryImages: gallery('full-basic'),
        introMarkdown: 'Full Upgrade Basic cocok untuk pengguna yang ingin speaker aftermarket dengan DSP processing dasar.',
        sections: [
          { title: 'A. PRODUK UTAMA', type: 'list', items: ['Speaker Front 2 Way — Premium Entry', 'DSP — Rainbow EL-PA4.6'] },
          { title: 'B. KABEL & MATERIAL', type: 'list', items: ['Kabel aki 8 AWG', 'Kabel speaker 16 AWG', 'RCA SQ 2,5m', 'Fuse Box ANL 1 line'] },
          { title: 'C. JASA INSTALASI & TUNING', type: 'list', items: ['Jasa instalasi', 'Phase checker', 'Setting & tuning DSP'] }
        ],
        closingTagline: 'Full Basic — Speaker Premium + DSP',
        closingComponents: ['Speaker Premium Entry', 'Rainbow DSP EL-PA4.6']
      },
      {
        name: 'Normal',
        tier: 'normal',
        sortOrder: 2,
        price: 'Rp 7.200.000',
        priceValue: 7200000,
        ribbonLabel: 'POPULAR',
        ribbonColor: 'blue',
        cardTitle: 'SPEAKER + DSP + POWER 4CH + SUB 10"',
        cardDescription: 'Tambah power 4ch + sub 10" untuk sistem lebih lengkap dan bertenaga.',
        galleryImages: gallery('full-normal'),
        introMarkdown: 'Full Upgrade Normal menambahkan power 4ch dan subwoofer 10" untuk sistem yang lebih bertenaga dengan bass lebih dalam.',
        sections: [
          { title: 'A. PRODUK UTAMA', type: 'list', items: ['Speaker Front 2 Way — Premium', 'DSP — Rainbow EL-PA4.6', 'Power 4ch — Premium', 'Subwoofer 10" — Premium'] },
          { title: 'B. KABEL, PILAR & BOX', type: 'list', items: ['Box kayu simple', 'Kabel aki 8 AWG', 'Kabel speaker 16 AWG', 'RCA SQ 2,5m', 'Fuse Box ANL 1 line'] },
          { title: 'C. JASA INSTALASI & TUNING', type: 'list', items: ['Jasa instalasi', 'Phase checker', 'Setting & tuning DSP'] }
        ],
        closingTagline: 'Full Normal — Speaker + Power + Subwoofer 10"',
        closingComponents: ['Speaker Premium', 'Rainbow DSP EL-PA4.6', 'Power 4ch Premium', 'Subwoofer 10" Premium']
      },
      {
        name: 'Best Buy',
        tier: 'best_buy',
        sortOrder: 3,
        price: 'Rp 9.800.000',
        priceValue: 9800000,
        ribbonLabel: 'BEST BUY',
        ribbonColor: 'amber',
        cardTitle: 'SPEAKER PREMIUM + DSP + SUB 12"',
        cardDescription: 'Speaker premium + DSP Rainbow + Power + Sub 12" + install premium. Konfigurasi terlengkap.',
        galleryImages: gallery('full-best-buy'),
        introMarkdown: 'Full Upgrade Best Buy adalah konfigurasi terlengkap dengan speaker premium, DSP Rainbow, power, dan subwoofer 12" untuk bass yang lebih dalam dan powerful.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'subsections',
            subsections: [
              { title: '1. Speaker Premium', subtitle: '2 Way Component', markdown: 'Speaker premium dengan komponen kualitas tinggi untuk reproduksi suara yang detail dan akurat.' },
              { title: '2. DSP — Rainbow EL-PA4.6', markdown: 'DSP Rainbow memberikan kontrol penuh atas parameter suara: crossover, EQ, time alignment, phase.' },
              { title: '3. Power 4ch Premium', markdown: 'Power amplifier 4 channel premium untuk drive speaker dengan tenaga optimal.' },
              { title: '4. Subwoofer 12"', markdown: 'Subwoofer 12" memberikan bass yang dalam dan bertenaga, melengkapi sistem dengan frekuensi rendah yang powerful.' }
            ]
          },
          { title: 'B. KABEL, PILAR & BOX', type: 'list', items: ['Box kayu custom', 'Kabel aki 8 AWG', 'Kabel speaker 16 AWG', 'RCA SQ 2,5m', 'Fuse Box ANL 1 line', 'Fuse Box ANL 2 line', 'Peredam Gran Turismo'] },
          { title: 'C. JASA INSTALASI & TUNING', type: 'list', items: ['Jasa instalasi premium', 'Phase checker', 'Selang flexible kabel aki', 'Ring midbass + finishing', 'Pembesaran plat + anti karat', 'Dudukan fuse box', 'Klem + solder + selang bakar', 'Sealer kabel', 'Plakban jalur tarikan pintu', 'Penutup cover stir', 'Wrapping jok & interior', 'Setting & tuning DSP lengkap'] },
          { title: 'TARGET HASIL SUARA', type: 'list', items: ['Vocal sangat jelas dan detail', 'Midbass solid dan punchy', 'Bass dalam, bertenaga, terkontrol', 'Soundstage luas dan presisi', 'Imaging fokus', 'Detail musik terbuka sempurna'] }
        ],
        closingTagline: 'BEST BUY — Full Premium Upgrade with Sub 12"',
        closingComponents: ['Speaker Premium', 'Rainbow DSP EL-PA4.6', 'Power 4ch Premium', 'Subwoofer 12" Premium']
      }
    ]
  },

  // === PRODUK 4: Peredam Only ===
  {
    name: 'Peredam Mobil',
    slug: 'peredam-mobil',
    category: 'Paket Peredam',
    shortDescription: 'Paket peredam mobil untuk mengurangi kebisingan kabin',
    waNumber: '6282211222399',
    variants: [
      {
        name: 'Basic',
        tier: 'basic',
        sortOrder: 1,
        price: 'Rp 1.200.000',
        priceValue: 1200000,
        ribbonLabel: 'BASIC',
        ribbonColor: 'slate',
        cardTitle: 'PEREDAM 4 PINTU',
        cardDescription: 'Peredam 4 pintu dengan butyl 2mm + foam absorber. Audio speaker jernih, suara jalan berkurang.',
        galleryImages: gallery('peredam-basic'),
        introMarkdown: 'Paket Basic Peredam fokus pada 4 pintu untuk meningkatkan kualitas audio speaker dan mengurangi kebisingan dari luar.',
        sections: [
          { title: 'A. MATERIAL PEREDAM', type: 'list', items: ['Butyl 2mm — 4 pintu', 'Foam Absorber — 4 pintu'] },
          { title: 'B. JASA INSTALASI', type: 'list', items: ['Jasa instalasi 4 pintu', 'Pembersihan door panel', 'Pemasangan presisi', 'Finishing & reassembly'] }
        ],
        closingTagline: 'Basic — Peredam 4 Pintu',
        closingComponents: ['Butyl 2mm', 'Foam Absorber']
      },
      {
        name: 'Normal',
        tier: 'normal',
        sortOrder: 2,
        price: 'Rp 1.800.000',
        priceValue: 1800000,
        ribbonLabel: 'POPULAR',
        ribbonColor: 'blue',
        cardTitle: 'PEREDAM 4 PINTU + KAP MESIN',
        cardDescription: 'Tambah peredam kap mesin untuk mengurangi panas & suara mesin. Lebih nyaman untuk harian.',
        galleryImages: gallery('peredam-normal'),
        introMarkdown: 'Paket Normal menambahkan peredam kap mesin untuk mengurangi panas dan suara mesin yang masuk ke kabin.',
        sections: [
          { title: 'A. MATERIAL PEREDAM', type: 'list', items: ['Butyl 2mm — 4 pintu', 'Foam Absorber — 4 pintu', 'Butyl Heat Shield — Kap Mesin'] },
          { title: 'B. JASA INSTALASI', type: 'list', items: ['Jasa instalasi 4 pintu + kap mesin', 'Pembersihan door panel', 'Pemasangan presisi', 'Finishing & reassembly'] }
        ],
        closingTagline: 'Normal — Peredam 4 Pintu + Kap Mesin',
        closingComponents: ['Butyl 2mm', 'Foam Absorber', 'Butyl Heat Shield']
      },
      {
        name: 'Best Buy',
        tier: 'best_buy',
        sortOrder: 3,
        price: 'Rp 3.500.000',
        priceValue: 3500000,
        ribbonLabel: 'BEST BUY',
        ribbonColor: 'amber',
        cardTitle: 'FULL KABIN + WHEEL HOUSING + KAP',
        cardDescription: 'Peredam full kabin + wheel housing + kap mesin. Kabín paling senyap untuk audio maksimal.',
        galleryImages: gallery('peredam-best-buy'),
        introMarkdown: 'Paket Best Buy Peredam mencakup full kabin, wheel housing, dan kap mesin. Hasilnya kabin paling senyap, audio maksimal, dan kenyamanan premium.',
        sections: [
          { title: 'A. MATERIAL PEREDAM', type: 'list', items: ['Butyl 2mm — Full Kabin', 'Foam Absorber — Full Kabin', 'Butyl Heat Shield — Kap Mesin', 'Absorber Wheel Housing'] },
          { title: 'B. JASA INSTALASI', type: 'list', items: ['Jasa instalasi full kabin', 'Bongkar interior lengkap', 'Pemasangan presisi', 'Reassembly rapi', 'Quality check'] }
        ],
        closingTagline: 'BEST BUY — Full Kabin + Wheel Housing + Kap Mesin',
        closingComponents: ['Butyl 2mm Full Kabin', 'Foam Absorber', 'Heat Shield Kap', 'Wheel Housing Absorber']
      }
    ]
  },

  // === PRODUK 5: Audio Tuning Service ===
  {
    name: 'Audio Tuning Service',
    slug: 'audio-tuning-service',
    category: 'Paket Service',
    shortDescription: 'Jasa tuning DSP profesional untuk sistem audio mobil',
    waNumber: '6282211222399',
    variants: [
      {
        name: 'Basic',
        tier: 'basic',
        sortOrder: 1,
        price: 'Rp 500.000',
        priceValue: 500000,
        ribbonLabel: 'BASIC',
        ribbonColor: 'slate',
        cardTitle: 'DSP TUNING (1 JAM)',
        cardDescription: 'Tuning DSP dasar 1 jam. Crossover, level, EQ basic untuk sistem existing.',
        galleryImages: gallery('tuning-basic'),
        introMarkdown: 'Paket Basic Tuning cocok untuk user dengan sistem audio existing yang ingin tuning dasar DSP selama 1 jam.',
        sections: [
          { title: 'A. SERVICE INCLUDE', type: 'list', items: ['Crossover setting', 'Level/Gain adjustment', 'EQ basic', 'Phase check'] },
          { title: 'B. DURASI', type: 'markdown', markdown: 'Estimasi 1 jam pengerjaan. Cocok untuk sistem yang sudah terpasang dan butuh fine-tuning.' }
        ],
        closingTagline: 'Basic — DSP Tuning 1 Jam',
        closingComponents: ['DSP Tuning Service']
      },
      {
        name: 'Normal',
        tier: 'normal',
        sortOrder: 2,
        price: 'Rp 850.000',
        priceValue: 850000,
        ribbonLabel: 'POPULAR',
        ribbonColor: 'blue',
        cardTitle: 'TUNING + RTA MEASUREMENT',
        cardDescription: 'Tuning lengkap dengan RTA measurement. Time alignment + EQ presisi.',
        galleryImages: gallery('tuning-normal'),
        introMarkdown: 'Paket Normal Tuning menambahkan RTA measurement untuk tuning yang lebih presisi dengan time alignment dan EQ detail.',
        sections: [
          { title: 'A. SERVICE INCLUDE', type: 'list', items: ['Crossover setting', 'Level/Gain adjustment', 'EQ presisi', 'Phase check', 'Time alignment', 'RTA measurement'] },
          { title: 'B. DURASI', type: 'markdown', markdown: 'Estimasi 2-3 jam pengerjaan. Untuk sistem yang ingin optimasi suara lebih detail.' }
        ],
        closingTagline: 'Normal — Tuning + RTA Measurement',
        closingComponents: ['DSP Tuning + RTA Service']
      },
      {
        name: 'Recommended',
        tier: 'recommended',
        sortOrder: 3,
        price: 'Rp 1.200.000',
        priceValue: 1200000,
        ribbonLabel: 'RECOMMENDED',
        ribbonColor: 'emerald',
        cardTitle: 'FULL TUNING + RTA + FOLLOW-UP',
        cardDescription: 'Full tuning + RTA + follow-up 1 bulan. Hasil optimal dengan garansi penyesuaian.',
        galleryImages: gallery('tuning-recommended'),
        introMarkdown: 'Paket Recommended Tuning adalah layanan paling lengkap dengan full tuning, RTA measurement, dan follow-up 1 bulan untuk penyesuaian setelah sistem break-in.',
        sections: [
          { title: 'A. SERVICE INCLUDE', type: 'list', items: ['Crossover setting lengkap', 'Level/Gain adjustment presisi', 'EQ 31-band', 'Phase check', 'Time alignment presisi', 'RTA measurement', 'Staging & imaging', 'Subwoofer integration'] },
          { title: 'B. FOLLOW-UP 1 BULAN', type: 'markdown', markdown: 'Setelah tuning awal, kami menyediakan follow-up 1 bulan kemudian untuk penyesuaian setelah sistem break-in. Memastikan suara tetap optimal setelah pemakaian.' },
          { title: 'C. GARANSI', type: 'list', items: ['Free adjustment 1x dalam 1 bulan', 'Konsultasi audio via WhatsApp', 'Priority booking untuk service berikutnya'] }
        ],
        closingTagline: 'RECOMMENDED — Full Tuning + RTA + Follow-up 1 Bulan',
        closingComponents: ['Full DSP Tuning', 'RTA Measurement', 'Follow-up Service']
      }
    ]
  }
]

// ============================================================
// Generate ID (deterministic for reproducibility)
// ============================================================
function genId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, '0')}-${Math.random().toString(36).substring(2, 10)}`
}

// ============================================================
// Main — generate mock data & inject ke backup JSON
// ============================================================
function main() {
  const backupPath = path.join(process.cwd(), 'data', 'backup-sqlite.json')
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))

  // Reset products & productVariants (hapus data lama)
  const products: unknown[] = []
  const productVariants: unknown[] = []
  let prodIdx = 0
  let varIdx = 0

  for (const mp of MOCK_PRODUCTS) {
    prodIdx++
    const productId = genId('prod', prodIdx)
    const now = new Date().toISOString()

    products.push({
      id: productId,
      name: mp.name,
      slug: mp.slug,
      category: mp.category,
      shortDescription: mp.shortDescription,
      imageUrl: mp.variants[0].galleryImages[0] ?? null,
      imageAlt: mp.name,
      waNumber: mp.waNumber,
      sortOrder: prodIdx,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    for (const mv of mp.variants) {
      varIdx++
      const variantId = genId('var', varIdx)
      const variantNow = new Date().toISOString()

      productVariants.push({
        id: variantId,
        productId,
        name: mv.name,
        slug: `${mp.slug}-${mv.tier.replace('_', '-')}`,
        tier: mv.tier,
        sortOrder: mv.sortOrder,
        price: mv.price,
        priceValue: mv.priceValue,
        priceNote: 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
        ribbonLabel: mv.ribbonLabel,
        ribbonColor: mv.ribbonColor,
        cardTitle: mv.cardTitle,
        cardDescription: mv.cardDescription,
        imageUrl: mv.galleryImages[0] ?? null,
        imageAlt: `${mp.name} ${mv.name}`,
        galleryImages: mv.galleryImages,
        tagline: 'Innovation Car Audio Jakarta',
        introMarkdown: mv.introMarkdown,
        sections: mv.sections,
        closingTagline: mv.closingTagline,
        closingComponents: mv.closingComponents,
        disclaimer: 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
        isActive: true,
        createdAt: variantNow,
        updatedAt: variantNow,
      })
    }
  }

  data.products = products
  data.productVariants = productVariants

  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))

  console.log('=== Mock data generated ===')
  console.log(`  Products: ${products.length}`)
  console.log(`  ProductVariants: ${productVariants.length}`)
  console.log(`  Backup file: ${backupPath}`)
  console.log()
  console.log('Product breakdown:')
  for (const mp of MOCK_PRODUCTS) {
    console.log(`  - ${mp.name} (${mp.variants.length} varian)`)
    for (const mv of mp.variants) {
      console.log(`    • ${mv.name} | ${mv.tier} | ${mv.price} | ribbon=${mv.ribbonLabel} (${mv.ribbonColor}) | gallery=${mv.galleryImages.length} imgs`)
    }
  }
}

main()
