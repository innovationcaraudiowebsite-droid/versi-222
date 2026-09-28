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
  },

  // === PRODUK 6: 2 Way Subwoofer Bawah Jok (dari artikel 3) ===
  {
    name: '2 Way Subwoofer Bawah Jok',
    slug: '2-way-subwoofer-bawah-jok',
    category: 'Paket Upgrade Audio',
    shortDescription: 'Sistem 2-way aktif + DSP + subwoofer compact bawah jok untuk bass tanpa mengorbankan bagasi',
    waNumber: '6282211222399',
    variants: [
      {
        name: 'Basic',
        tier: 'basic',
        sortOrder: 1,
        price: 'Rp 5.500.000',
        priceValue: 5500000,
        ribbonLabel: 'BASIC',
        ribbonColor: 'slate',
        cardTitle: '2-WAY PASSIVE + DSP',
        cardDescription: 'Speaker 2-way passive + DSP Rainbow. Tanpa subwoofer, fokus vocal clarity untuk daily use.',
        galleryImages: gallery('subbawahjok-basic'),
        introMarkdown: 'Paket Basic 2 Way Subwoofer Bawah Jok cocok untuk pengguna yang ingin speaker 2-way aftermarket dengan DSP processing, tanpa penambahan subwoofer.',
        sections: [
          { title: 'A. PRODUK UTAMA', type: 'list', items: ['Speaker Front 2 Way — GZRT 25 SQ + GZRK 165 SQ', 'DSP — Rainbow EL-PA4.6', 'Kontroler DSP — Rainbow EL-PA4.6'] },
          { title: 'B. KABEL & MATERIAL', type: 'list', items: ['Kabel aki & ground 8 AWG', 'Fuse Box ANL 1 line', 'Kabel speaker Front 16 AWG', 'Kabel input DSP 16 AWG', 'RCA SQ 2,5m', 'Kabel remote'] },
          { title: 'C. JASA INSTALASI & TUNING', type: 'list', items: ['Jasa instalasi', 'Phase checker', 'Setting & tuning DSP dasar'] }
        ],
        closingTagline: 'Basic — 2-Way + DSP Processing',
        closingComponents: ['GZRT 25 SQ', 'GZRK 165 SQ', 'Rainbow DSP EL-PA4.6']
      },
      {
        name: 'Normal',
        tier: 'normal',
        sortOrder: 2,
        price: 'Rp 7.800.000',
        priceValue: 7800000,
        ribbonLabel: 'POPULAR',
        ribbonColor: 'blue',
        cardTitle: '2-WAY + DSP + SUB 8" ENTRY',
        cardDescription: 'Tambah subwoofer 8" entry level bawah jok untuk bass lebih dalam. Combo seimbang untuk daily audio.',
        galleryImages: gallery('subbawahjok-normal'),
        introMarkdown: 'Paket Normal menambahkan subwoofer 8" entry level bawah jok untuk melengkapi frekuensi rendah. DSP Rainbow memberikan kontrol penuh sistem dengan konsep compact.',
        sections: [
          { title: 'A. PRODUK UTAMA', type: 'list', items: ['Speaker Front 2 Way — GZRT 25 SQ + GZRK 165 SQ', 'DSP — Rainbow EL-PA4.6', 'Power Mono — Entry Level', 'Subwoofer 8" Entry Level — Bawah Jok'] },
          { title: 'B. KABEL, POWER & SIGNAL', type: 'list', items: ['Dek dasar subwoofer', 'Kabel aki & ground 8 AWG', 'Fuse Box ANL 1 line', 'Kabel speaker Front 16 AWG', 'Kabel input DSP 16 AWG', 'RCA SQ 2,5m', 'Kabel remote'] },
          { title: 'C. JASA INSTALASI & TUNING', type: 'list', items: ['Jasa instalasi', 'Phase checker', 'Dudukan fuse box', 'Klem kabel + solder', 'Sealer kabel', 'Setting & tuning DSP'] }
        ],
        closingTagline: 'Normal — 2-Way + DSP + Subwoofer 8" Bawah Jok',
        closingComponents: ['GZRT 25 SQ', 'GZRK 165 SQ', 'Rainbow DSP EL-PA4.6', 'Subwoofer 8" Entry Level']
      },
      {
        name: 'Best Buy',
        tier: 'best_buy',
        sortOrder: 3,
        price: 'Rp 9.500.000',
        priceValue: 9500000,
        ribbonLabel: 'BEST BUY',
        ribbonColor: 'amber',
        cardTitle: '2-WAY ACTIVE + DSP + SUB BAWAH JOK',
        cardDescription: 'GZ RadioActive 2-way aktif + DSP Rainbow + Sub 8" Zevox bawah jok + Peredam Gran Turismo. Konfigurasi lengkap.',
        galleryImages: gallery('subbawahjok-best-buy'),
        introMarkdown: 'Paket audio mobil 2 Way Subwoofer Bawah Jok – Best Buy Package dari Innovation Car Audio Jakarta merupakan paket yang dirancang untuk pengguna yang menginginkan peningkatan kualitas suara yang lebih serius, dengan kombinasi 2-way aktif, DSP processor, dan subwoofer compact.\n\nPaket ini menggunakan GZ RadioActive sebagai sistem speaker depan, terdiri dari GZRT 25 SQ dan GZRK 165 SQ, yang dikendalikan secara aktif melalui DSP Rainbow EL-PA4.6. Konfigurasi ini memberikan kontrol yang lebih luas terhadap masing-masing speaker, sehingga proses tuning dapat dilakukan dengan lebih presisi untuk mendapatkan keseimbangan suara, staging, imaging, dan integrasi bass yang lebih baik.',
        sections: [
          {
            title: '2-WAY FRONT – GZ RADIOACTIVE',
            type: 'markdown',
            markdown: 'Sebagai sistem speaker depan digunakan kombinasi GZRT 25 SQ dan GZRK 165 SQ. Keduanya membentuk sistem 2-way aktif, dengan tweeter dan midbass mendapatkan pengaturan melalui DSP secara lebih terkontrol.\n\nKonsep aktif memberikan fleksibilitas tuning yang lebih luas dibanding sistem passive crossover konvensional. Karakter suara speaker dapat disesuaikan melalui DSP agar lebih sesuai dengan posisi pemasangan dan karakter akustik kabin kendaraan.\n\nHasil akhirnya diarahkan untuk menghadirkan suara depan yang lebih terfokus, vokal yang lebih jelas, detail yang lebih mudah terbaca, serta staging yang lebih teratur.'
          },
          {
            title: 'DSP RAINBOW EL-PA4.6',
            type: 'markdown',
            markdown: 'Sebagai pusat pengolahan sistem digunakan DSP Rainbow EL-PA4.6, lengkap dengan Controller DSP Rainbow EL-PA4.6.\n\nDSP menjadi bagian penting dalam konfigurasi 2-way aktif karena masing-masing jalur speaker membutuhkan pengaturan yang lebih detail.\n\nMelalui proses DSP setting dan tuning, sistem dapat diatur untuk membantu mendapatkan tonal balance yang lebih seimbang, pembagian frekuensi yang lebih terkontrol, staging dan imaging yang lebih terarah, fokus vokal yang lebih baik, detail musik yang lebih mudah terdengar, dan integrasi midbass dengan subwoofer yang lebih natural.\n\nController DSP juga memberikan kemudahan bagi pengguna untuk melakukan pengaturan karakter suara sesuai kebutuhan.'
          },
          {
            title: 'SUBWOOFER 8" – ZEVox ZV 8 SAS',
            type: 'markdown',
            markdown: 'Untuk melengkapi reproduksi frekuensi rendah, paket menggunakan Subwoofer 8" Zevox ZV 8 SAS dengan konsep Subwoofer Bawah Jok.\n\nUkuran 8" dipilih untuk menjaga konsep sistem tetap compact sekaligus memberikan tambahan fondasi bass yang tidak didapatkan secara maksimal dari sistem 2-way depan saja.\n\nDengan pengaturan melalui DSP, subwoofer dapat diselaraskan dengan karakter midbass sehingga transisi dari speaker depan menuju frekuensi rendah terasa lebih menyatu.\n\nKonsep ini cocok untuk pengguna yang menginginkan sistem lebih lengkap tanpa harus menggunakan instalasi subwoofer berukuran besar di area bagasi.'
          },
          {
            title: 'KONFIGURASI DSP',
            type: 'subsections',
            subsections: [
              { title: 'DSP 6CH – TIDAK BISA', markdown: 'Untuk konfigurasi 2-way aktif yang dibutuhkan, DSP 6CH tidak mencukupi karena channel terpakai semua untuk front aktif.' },
              { title: 'DSP 8CH (Recommended)', markdown: 'Front: ON, Rear: OFF, Sub: ON — Sistem difokuskan pada 2-way front aktif + subwoofer. Seluruh channel tersedia digunakan untuk konfigurasi utama.' },
              { title: 'DSP 10CH (Alternatif)', markdown: 'Front: ON, Rear: ON, Sub: ON — Jika kendaraan membutuhkan speaker belakang tetap aktif, konfigurasi dapat menggunakan DSP 10CH.' }
            ]
          },
          {
            title: 'KABEL, POWER & SIGNAL',
            type: 'list',
            items: ['Kabel aki & ground 8 AWG', 'Fuse box ANL 1 line', 'Fuse box ANL 2 line', 'Kabel speaker Front 16 AWG', 'Kabel input DSP 16 AWG', 'RCA SQ 2,5 meter', 'Kabel remote', 'Dek dasar subwoofer']
          },
          {
            title: 'PEREDAM & SUPPORT INSTALLATION',
            type: 'markdown',
            markdown: 'Paket dilengkapi Peredam Gran Turismo sebanyak 3 lembar. Peredam digunakan sebagai bagian dari support instalasi untuk membantu mengurangi resonansi pada area yang membutuhkan penanganan sekaligus mendukung performa speaker depan.'
          },
          {
            title: 'RING MIDBASS & SUPPORT',
            type: 'list',
            items: ['Ring midbass + finishing cat', 'Pembesaran plat + anti karat']
          },
          {
            title: 'PROFESSIONAL INSTALLATION',
            type: 'list',
            items: ['Phase checker', 'Selang flexible kabel aki di ruang mesin', 'Ring midbass + cat', 'Pembesaran plat + anti karat', 'Dudukan fuse box', 'Klem kabel', 'Solder dan heat shrink', 'Sealer kabel', 'Perlindungan area tarikan pintu & kisi AC', 'Penutup cover stir', 'Wrapping plastik untuk jok dan interior', 'Penataan kabel dan perangkat', 'DSP setting & tuning']
          },
          {
            title: 'KENAPA BEST BUY?',
            type: 'markdown',
            markdown: 'Konfigurasi ini memberikan kombinasi yang lebih lengkap:\n\nGZ RADIOACTIVE 2-WAY AKTIF\n↓\nDSP RAINBOW EL-PA4.6\n↓\nSUBWOOFER 8" ZEVox\n↓\nPROFESSIONAL INSTALLATION & DSP TUNING\n\nFokus utama paket ini adalah mendapatkan kualitas suara depan yang lebih serius melalui konfigurasi 2-way aktif, kemudian melengkapinya dengan subwoofer bawah jok untuk memberikan fondasi bass yang lebih penuh.\n\nDibanding konfigurasi 2-way passive, sistem aktif memberikan ruang tuning yang lebih luas karena masing-masing jalur speaker dapat dikontrol melalui DSP.'
          },
          {
            title: 'PACKAGE SUMMARY',
            type: 'markdown',
            markdown: '2 WAY SUBWOOFER BAWAH JOK – BEST BUY PACKAGE merupakan pilihan untuk pengguna yang ingin membangun sistem audio dengan konsep 2-way aktif + DSP + subwoofer compact.\n\nDengan GZRT 25 SQ + GZRK 165 SQ, sistem memiliki fondasi speaker depan yang lebih serius. DSP Rainbow EL-PA4.6 memberikan kontrol dan fleksibilitas tuning, sementara Zevox ZV 8 SAS melengkapi sistem dengan reproduksi bass.\n\nSeluruhnya didukung instalasi profesional, jalur power dan signal yang tertata, peredam Gran Turismo, pengerjaan ring midbass, serta proses DSP tuning.'
          }
        ],
        closingTagline: 'ACTIVE 2-WAY. DSP CONTROL. COMPACT BASS.',
        closingComponents: ['GZRT 25 SQ', 'GZRK 165 SQ', 'DSP Rainbow EL-PA4.6', 'Subwoofer 8" Zevox ZV 8 SAS']
      }
    ]
  },

  // === PRODUK 7: Upgrade Audio Series (4 varian dari 4 file upload) ===
  {
    name: 'Upgrade Audio Series',
    slug: 'upgrade-audio-series',
    category: 'Paket Upgrade Audio',
    shortDescription: 'Seri paket upgrade audio 2 Way + DSP + Power Mono + Subwoofer 10" dengan 4 tier pilihan',
    waNumber: '6282211222399',
    variants: [
      // === BASIC: Infinity Alpha 650C / 603C ===
      {
        name: 'Basic',
        tier: 'basic',
        sortOrder: 1,
        price: 'Rp 4.500.000',
        priceValue: 4500000,
        ribbonLabel: 'BASIC',
        ribbonColor: 'slate',
        cardTitle: '2 WAY + DSP + SUB 10" (INFINITY)',
        cardDescription: 'Speaker Infinity Alpha 650C + DSP Rainbow + Power Mono + Sub 10". Upgrade lengkap untuk daily use.',
        galleryImages: gallery('upgrade-basic'),
        introMarkdown: 'Paket Entry Basic merupakan pilihan upgrade audio untuk pengguna yang ingin mendapatkan peningkatan kualitas suara secara menyeluruh dengan konfigurasi 2 Way 6.5" + DSP + Power Mono + Subwoofer 10".\n\nMenggunakan Infinity Alpha 650C / 603C sebagai speaker depan, dipadukan dengan DSP Rainbow EL-PA4.6, Power Mono Prototype Quarto, dan Subwoofer 10" Prototype Quarto.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'subsections',
            subsections: [
              { title: '1. Infinity Alpha 650C / 603C', subtitle: '2 Way 6.5" Pasif', markdown: 'Speaker 2 Way Infinity digunakan sebagai speaker utama bagian depan. Dirancang untuk memberikan peningkatan pada vocal, detail musik, dan reproduksi midbass, sehingga suara terasa lebih jelas dan lebih seimbang dibandingkan sistem audio standar.' },
              { title: '2. DSP Rainbow EL-PA4.6', markdown: 'DSP berfungsi sebagai pusat pengolahan suara. Pengaturan DSP meliputi Crossover, Level/Gain, Equalizer, Phase, Time Alignment, Staging, Imaging, dan Integrasi speaker dengan subwoofer.' },
              { title: '3. Kontroler DSP Rainbow EL-PA4.6', markdown: 'Kontroler digunakan untuk memudahkan pengoperasian dan pengaturan DSP sesuai kebutuhan sistem.' },
              { title: '4. Power Mono Prototype Quarto', markdown: 'Power mono digunakan sebagai penguat khusus untuk sistem subwoofer. Dengan dedicated power untuk subwoofer, kebutuhan tenaga dapat disalurkan secara lebih optimal sehingga reproduksi frekuensi rendah dapat terdengar lebih bertenaga dan terkontrol.' },
              { title: '5. Subwoofer 10" Prototype Quarto', markdown: 'Subwoofer 10" memberikan tambahan reproduksi frekuensi rendah untuk menghasilkan bass yang lebih dalam, berisi, dan bertenaga. Dikombinasikan dengan power mono, subwoofer dapat memberikan karakter bass yang lebih lengkap tanpa mengganggu reproduksi vocal dan detail dari speaker depan.' }
            ]
          },
          {
            title: 'KONFIGURASI CHANNEL DSP',
            type: 'subsections',
            subsections: [
              { title: 'DSP 6 Channel', markdown: 'Front: ON, Rear: OFF, Sub: ON' },
              { title: 'DSP 8 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON' },
              { title: 'DSP 10 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON — Konfigurasi dapat disesuaikan dengan jumlah channel DSP dan kebutuhan sistem audio kendaraan.' }
            ]
          },
          {
            title: 'B. KABEL, PILAR & BOX',
            type: 'list',
            items: [
              'Box kayu simple',
              'Kabel aki & ground 8 AWG',
              'Fuse Box ANL jepit 1 line',
              'Fuse Box ANL jepit 2 line',
              'Kabel remote',
              'Kabel speaker Front 16 AWG',
              'Kabel Subwoofer 16 AWG',
              'Kabel input DSP 16 AWG',
              'RCA SQ 2,5 meter',
              'Peredam Gran Turismo'
            ]
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: [
              'Jasa instalasi',
              'Phase checker',
              'Selang flexible kabel aki ruang mesin',
              'Ring midbass + finishing cat',
              'Pembesaran plat + anti karat',
              'Dudukan fuse box',
              'Klem kabel + solder + selang bakar',
              'Sealer kabel',
              'Plakban jalur tarikan pintu & kisi AC',
              'Penutup cover stir',
              'Wrapping plastik untuk jok & interior',
              'Jasa setting DSP'
            ]
          },
          {
            title: 'DSP SETTING & FINAL TUNING',
            type: 'markdown',
            markdown: 'Setelah instalasi selesai, dilakukan proses DSP Setting & Tuning untuk menyelaraskan speaker depan dengan sistem subwoofer.\n\nParameter yang disesuaikan meliputi: Crossover → Level/Gain → EQ → Phase → Time Alignment → Staging → Imaging → Subwoofer Integration.\n\nTuning dilakukan agar suara dari speaker depan dan subwoofer dapat bekerja secara harmonis, dengan transisi bass yang lebih natural dan tidak mengganggu vocal.'
          },
          {
            title: 'TARGET HASIL SUARA',
            type: 'list',
            items: [
              'Vocal lebih jelas',
              'Detail musik lebih terdengar',
              'Midbass lebih berisi',
              'Suara lebih seimbang',
              'Bass lebih dalam dan bertenaga',
              'Bass tetap terkontrol',
              'Staging lebih terbuka',
              'Imaging lebih terarah',
              'Integrasi speaker dan subwoofer lebih menyatu',
              'Nyaman untuk penggunaan harian'
            ]
          }
        ],
        closingTagline: 'ENTRY BASIC — 2 Way + DSP + Power Mono + Subwoofer 10"',
        closingComponents: ['Infinity Alpha 650C / 603C', 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', 'Subwoofer 10" Prototype Quarto']
      },

      // === NORMAL: Rainbow Experience Line EL-C6.2 ===
      {
        name: 'Normal',
        tier: 'normal',
        sortOrder: 2,
        price: 'Rp 6.200.000',
        priceValue: 6200000,
        ribbonLabel: 'POPULAR',
        ribbonColor: 'blue',
        cardTitle: '2 WAY + DSP + SUB 10" (RAINBOW EL)',
        cardDescription: 'Speaker Rainbow Experience Line EL-C6.2 + DSP Rainbow + Power Mono + Sub 10". Daily audio dengan tonal balance baik.',
        galleryImages: gallery('upgrade-normal'),
        introMarkdown: 'Paket Normal dirancang sebagai upgrade audio system yang lengkap untuk penggunaan harian dengan peningkatan kualitas suara pada area depan dan belakang, sekaligus memberikan dukungan bass yang lebih dalam dan bertenaga.\n\nKombinasi Rainbow Experience Line EL-C6.2, Rainbow DSP EL-PA4.6, Power Mono Prototype Quarto, dan Subwoofer 10" Prototype Quarto menghasilkan sistem yang lebih lengkap, dengan karakter suara yang detail, tonal balance yang baik, vocal lebih jelas, midbass lebih berisi, serta low bass yang lebih dalam dan terkontrol.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'subsections',
            subsections: [
              { title: '1. Rainbow Experience Line EL-C6.2', subtitle: '2 Way 6.5" Pasif', markdown: 'Menjadi speaker utama untuk reproduksi suara depan dengan kombinasi tweeter dan midbass 6.5". Karakter sistem diarahkan untuk menghasilkan vocal yang lebih jelas dan natural, detail musik lebih terdengar, midbass lebih berisi, treble tetap terbuka namun nyaman, dan suara musik lebih seimbang untuk penggunaan harian.' },
              { title: '2. Rainbow DSP EL-PA4.6', markdown: 'DSP digunakan sebagai pusat pengolahan dan tuning sistem audio. Pengaturan meliputi Crossover, EQ, Level & Gain, Phase, Time Alignment, Speaker balancing, Staging, Imaging, dan Integrasi Front/Rear/Subwoofer.' },
              { title: '3. Kontroler DSP Rainbow EL-PA4.6', markdown: 'Kontroler digunakan untuk memberikan akses pengaturan DSP secara lebih praktis.' },
              { title: '4. Power Mono Prototype Quarto', markdown: 'Power mono digunakan sebagai amplifier khusus untuk menggerakkan subwoofer. Penggunaan amplifier khusus subwoofer memberikan suplai tenaga yang lebih sesuai untuk reproduksi frekuensi rendah.' },
              { title: '5. Subwoofer 10" Prototype Quarto', markdown: 'Subwoofer 10" digunakan untuk memperluas reproduksi frekuensi rendah yang tidak dapat dihasilkan secara optimal oleh speaker 6.5". Target: low bass lebih dalam, bass lebih berisi, pukulan bass lebih terasa, bass tetap terkontrol, integrasi yang baik dengan midbass speaker.' }
            ]
          },
          {
            title: 'KONFIGURASI CHANNEL DSP',
            type: 'subsections',
            subsections: [
              { title: 'DSP 6 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON' },
              { title: 'DSP 8 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON' },
              { title: 'DSP 10 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON — Seluruh konfigurasi dirancang agar sistem dapat menggunakan Front + Rear + Subwoofer secara aktif melalui pengolahan DSP.' }
            ]
          },
          {
            title: 'B. KABEL, PILAR & BOX',
            type: 'list',
            items: [
              'BOX:',
              'Box kayu simple',
              'KABEL POWER:',
              'Kabel aki & ground 8 AWG (65/m × 9)',
              'Fuse Box ANL jepit 1 line',
              'Fuse Box ANL jepit 2 line',
              'Kabel remote (1 m × 5)',
              'KABEL SPEAKER & SIGNAL:',
              'Kabel speaker Front 16 AWG (15/m × 12)',
              'Kabel Sub 16 AWG (15/m × 4)',
              'Kabel input DSP 16 AWG (15/m × 10)',
              'RCA SQ 2.5 m',
              'PEREDAM:',
              'Peredam Gran Turismo (180/lbr × 3)'
            ]
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: [
              'Jasa instalasi',
              'Phase checker',
              'Selang flexible kabel aki ruang mesin',
              'Ring midbass + cat',
              'Pembesaran plat + anti karat',
              'Dudukan Fuse Box',
              'Klem kabel + solder + selang bakar',
              'Sealer kabel',
              'Plakban tarikan pintu & kisi AC',
              'Penutup cover stir',
              'Wrapping plastik untuk jok & interior'
            ]
          },
          {
            title: 'DSP SETTING & FINAL TUNING',
            type: 'markdown',
            markdown: 'Setelah seluruh perangkat terpasang, sistem akan melalui proses setting dan tuning.\n\nParameter yang diperhatikan: Crossover Front, Crossover Rear, Crossover Subwoofer, Level masing-masing channel, EQ dan tonal balance, Phase speaker dan subwoofer, Time Alignment, Integrasi midbass dengan subwoofer, Staging, Imaging, Keseimbangan suara kiri dan kanan, Final listening adjustment.\n\nTuning dilakukan untuk mendapatkan karakter suara yang seimbang serta memastikan subwoofer 10" dapat menyatu dengan sistem speaker tanpa membuat bass terasa berlebihan atau terpisah dari suara utama.'
          },
          {
            title: 'TARGET HASIL SUARA',
            type: 'markdown',
            markdown: '**Vocal** — Lebih jelas, fokus dan mudah dinikmati.\n\n**Detail** — Informasi musik lebih terdengar dengan pemisahan instrumen yang lebih baik.\n\n**Midbass** — Lebih berisi dan memiliki impact yang lebih terasa.\n\n**Bass** — Subwoofer 10" memberikan low bass yang lebih dalam dengan tenaga yang lebih besar.\n\n**Staging & Imaging** — DSP membantu mengatur posisi dan keseimbangan suara agar panggung suara lebih terarah.\n\n**Overall Balance** — Front, Rear dan Subwoofer dibuat bekerja sebagai satu kesatuan sistem.'
          },
          {
            title: 'KEUNGGULAN PAKET NORMAL',
            type: 'list',
            items: [
              '2 Way 6.5" Rainbow Experience Line EL-C6.2',
              'Rainbow DSP EL-PA4.6',
              'Kontroler DSP',
              'Power Mono Prototype Quarto',
              'Subwoofer 10" Prototype Quarto',
              'Konfigurasi Front + Rear + Sub',
              'Pengaturan crossover dan EQ melalui DSP',
              'Time Alignment & Phase Adjustment',
              'Instalasi kelistrikan dan kabel secara rapi',
              'Peredam untuk mendukung sistem speaker',
              'Final tuning setelah instalasi'
            ]
          }
        ],
        closingTagline: 'PAKET NORMAL — Rainbow Experience Line EL-C6.2 + DSP + Subwoofer 10"',
        closingComponents: ['Rainbow Experience Line EL-C6.2', 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', 'Subwoofer 10" Prototype Quarto']
      },

      // === BEST BUY: Blam Relax 165 RX ===
      {
        name: 'Best Buy',
        tier: 'best_buy',
        sortOrder: 3,
        price: 'Rp 8.500.000',
        priceValue: 8500000,
        ribbonLabel: 'BEST BUY',
        ribbonColor: 'amber',
        cardTitle: '2 WAY + DSP + SUB 10" (BLAM RELAX)',
        cardDescription: 'Speaker Blam Relax 165 RX + DSP Rainbow + Power Mono + Sub 10". Detail, impact, dan bass yang lebih terasa.',
        galleryImages: gallery('upgrade-best-buy'),
        introMarkdown: 'Paket ENTRY – Best Buy merupakan paket upgrade audio yang dirancang untuk pengguna yang menginginkan peningkatan kualitas suara secara menyeluruh dengan kombinasi speaker Blam Relax 165 RX, Rainbow DSP EL-PA4.6, Power Mono Prototype Quarto, dan Subwoofer 10" Prototype Quarto.\n\nKombinasi ini memberikan peningkatan mulai dari vocal, detail, midbass, staging hingga low bass, sementara DSP digunakan untuk mengatur karakter dan integrasi seluruh sistem agar terdengar lebih seimbang dan menyatu.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'subsections',
            subsections: [
              { title: '1. Blam Relax 165 RX', subtitle: '2 Way 6.5" Pasif', markdown: 'Blam Relax 165 RX menjadi speaker utama untuk menghasilkan karakter suara yang lebih detail dan natural. Sistem 2 way terdiri dari tweeter dan midbass 6.5" yang bekerja untuk menghasilkan vocal lebih jelas, detail musik lebih mudah terdengar, midbass lebih berisi, treble lebih terbuka, reproduksi musik lebih seimbang, dan karakter suara nyaman untuk penggunaan harian.' },
              { title: '2. Rainbow DSP EL-PA4.6', markdown: 'DSP berfungsi sebagai pusat pengolahan dan pengaturan sistem audio. Melalui DSP, sistem dapat dilakukan pengaturan: Crossover, EQ, Level & Gain, Phase, Time Alignment, Balance, Staging, Imaging, Integrasi speaker dengan subwoofer.' },
              { title: '3. Kontroler DSP Rainbow EL-PA4.6', markdown: 'Kontroler digunakan untuk mempermudah pengoperasian dan pengaturan DSP sesuai kebutuhan sistem.' },
              { title: '4. Power Mono Prototype Quarto', markdown: 'Power mono digunakan khusus untuk menggerakkan subwoofer. Dengan amplifier khusus untuk kanal subwoofer, tenaga yang diberikan dapat difokuskan pada reproduksi frekuensi rendah sehingga subwoofer mampu menghasilkan bass yang lebih bertenaga dan tetap terkontrol.' },
              { title: '5. Subwoofer 10" Prototype Quarto', markdown: 'Subwoofer 10" berfungsi melengkapi frekuensi rendah yang tidak dapat direproduksi secara optimal oleh speaker 6.5". Target: low bass lebih dalam, bass lebih berisi, impact lebih terasa, tekanan bass lebih kuat, bass tetap terkontrol, integrasi yang baik dengan midbass.' }
            ]
          },
          {
            title: 'KONFIGURASI CHANNEL DSP',
            type: 'subsections',
            subsections: [
              { title: 'DSP 6 Channel', markdown: 'TIDAK BISA — Tidak mencukupi untuk konfigurasi 2-way aktif yang dibutuhkan.' },
              { title: 'DSP 8 Channel', markdown: 'Front: ON, Rear: OFF, Sub: ON — Konfigurasi ini menggunakan speaker Front dan Subwoofer sebagai sistem utama. Cocok untuk mendapatkan fokus kualitas suara dari area depan dengan dukungan low bass dari subwoofer.' },
              { title: 'DSP 10 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON — Konfigurasi ini memungkinkan sistem menggunakan Front, Rear dan Subwoofer secara aktif melalui DSP, sehingga cakupan suara di dalam kabin menjadi lebih lengkap.' }
            ]
          },
          {
            title: 'B. KABEL, PILAR & BOX',
            type: 'list',
            items: [
              'BOX:',
              'Box kayu simple',
              'KABEL POWER:',
              'Kabel aki & ground 8 AWG (65/m × 9)',
              'Fuse Box ANL jepit 1 line',
              'Fuse Box ANL jepit 2 line',
              'Kabel remote (1 m × 5)',
              'KABEL SPEAKER & SIGNAL:',
              'Kabel speaker Front 16 AWG (15/m × 12)',
              'Kabel Sub 16 AWG (15/m × 4)',
              'Kabel input DSP 16 AWG (15/m × 10)',
              'RCA SQ 2.5 m',
              'PEREDAM:',
              'Peredam Gran Turismo (180/lbr × 3)'
            ]
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: [
              'Jasa instalasi',
              'Phase checker',
              'Selang flexible kabel aki ruang mesin',
              'Ring midbass + cat',
              'Pembesaran plat + anti karat',
              'Dudukan Fuse Box',
              'Klem kabel + solder + selang bakar',
              'Sealer kabel',
              'Plakban tarikan pintu & kisi AC',
              'Penutup cover stir',
              'Wrapping plastik untuk jok & interior'
            ]
          },
          {
            title: 'DSP SETTING & FINAL TUNING',
            type: 'markdown',
            markdown: 'Setelah proses instalasi selesai, seluruh sistem akan dilakukan DSP setting dan final tuning.\n\nPengaturan meliputi: Crossover Front, Crossover Rear, Crossover Subwoofer, EQ, Level masing-masing channel, Gain, Phase, Time Alignment, Balance kiri & kanan, Integrasi midbass dengan subwoofer, Staging, Imaging, Final listening adjustment.\n\nTuning dilakukan untuk mendapatkan karakter suara yang seimbang antara Blam Relax 165 RX dan Subwoofer 10", sehingga bass tetap menyatu dengan musik dan tidak terdengar berdiri sendiri.'
          },
          {
            title: 'TARGET HASIL SUARA',
            type: 'markdown',
            markdown: '**VOCAL** — Vocal lebih jelas, fokus dan mudah dinikmati.\n\n**DETAIL** — Detail instrumen lebih terdengar dengan pemisahan suara yang lebih baik.\n\n**MIDBASS** — Midbass 6.5" memberikan impact dan body suara yang lebih terasa.\n\n**LOW BASS** — Subwoofer 10" memberikan tambahan frekuensi rendah yang lebih dalam dan bertenaga.\n\n**STAGING & IMAGING** — DSP membantu mengatur posisi, keseimbangan dan fokus suara sehingga staging lebih terarah.\n\n**OVERALL BALANCE** — Speaker dan subwoofer disesuaikan melalui DSP agar bekerja sebagai satu sistem yang lebih menyatu.'
          },
          {
            title: 'KEUNGGULAN ENTRY – BEST BUY',
            type: 'list',
            items: [
              'Blam Relax 165 RX 2 Way 6.5"',
              'Rainbow DSP EL-PA4.6',
              'Kontroler DSP',
              'Power Mono Prototype Quarto',
              'Subwoofer 10" Prototype Quarto',
              'Dukungan konfigurasi Front + Sub atau Front + Rear + Sub',
              'Crossover & EQ melalui DSP',
              'Time Alignment & Phase Adjustment',
              'Power amplifier khusus subwoofer',
              'Subwoofer 10" untuk low bass lebih dalam',
              'Instalasi kelistrikan dan kabel secara rapi',
              'Peredam Gran Turismo',
              'Phase checking',
              'Final DSP tuning'
            ]
          }
        ],
        closingTagline: 'ENTRY – BEST BUY — Blam Relax 165 RX + DSP + Power Mono + Sub 10"',
        closingComponents: ['Blam Relax 165 RX', 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', 'Subwoofer 10" Prototype Quarto'],
        disclaimer: 'Harga non-diskon mengikuti harga yang tercantum pada brosur.'
      },

      // === RECOMMENDED: GZ Mercy GZCS 100.2 MB (2 Way 4") ===
      {
        name: 'Recommended',
        tier: 'recommended',
        sortOrder: 4,
        price: 'Rp 11.000.000',
        priceValue: 11000000,
        ribbonLabel: 'RECOMMENDED',
        ribbonColor: 'emerald',
        cardTitle: '2 WAY 4" + DSP + SUB 10" (GZ MERCY)',
        cardDescription: 'GZ Mercy GZCS 100.2 MB 2 Way 4" + DSP Rainbow + Power Mono + Sub 10" + Jaring CNC Midrange.',
        galleryImages: gallery('upgrade-recommended'),
        introMarkdown: 'Paket Recommended ini dirancang untuk pengguna yang menginginkan upgrade audio dengan karakter suara yang lebih fokus, detail dan terarah, menggunakan GZ Mercy GZCS 100.2 MB 2 Way 4", Rainbow DSP EL-PA4.6, Power Mono Prototype Quarto, serta Subwoofer 10" Prototype Quarto.\n\nKombinasi speaker 4" dengan DSP memberikan karakter suara yang lebih fokus pada area vocal dan detail, sementara subwoofer 10" memberikan dukungan frekuensi rendah sehingga sistem tetap memiliki bass yang lebih dalam dan berisi.\n\nKeunggulan lainnya, Jaring CNC Midrange sudah termasuk dari speaker GZ Mercy GZCS 100.2 MB, sehingga tampilan area midrange menjadi lebih rapi sekaligus memberikan finishing yang lebih premium.',
        sections: [
          {
            title: 'A. PRODUK UTAMA',
            type: 'subsections',
            subsections: [
              { title: '1. GZ Mercy GZCS 100.2 MB', subtitle: '2 Way 4" Pasif', markdown: 'GZ Mercy GZCS 100.2 MB menjadi speaker utama dengan konfigurasi 2 way 4". Ukuran 4" memberikan karakter suara yang lebih fokus pada reproduksi vocal, midrange dan detail musik. Target: vocal lebih jelas, midrange lebih fokus, detail musik lebih mudah terdengar, suara lebih terbuka, imaging lebih terarah, karakter nyaman untuk penggunaan harian.' },
              { title: 'Jaring CNC Midrange (sudah termasuk dari speaker)', markdown: 'Jaring CNC Midrange sudah termasuk dalam paket speaker GZ Mercy GZCS 100.2 MB, sehingga tidak dihitung sebagai item tambahan. Jaring CNC memberikan tampilan yang lebih rapi dan menyatu dengan area instalasi speaker, sekaligus memberikan kesan finishing yang lebih premium.' },
              { title: '2. Rainbow DSP EL-PA4.6', markdown: 'Rainbow DSP EL-PA4.6 digunakan sebagai pusat pengolahan dan tuning sistem audio. DSP memungkinkan pengaturan: Crossover, EQ, Level & Gain, Phase, Time Alignment, Balance, Staging, Imaging, Integrasi speaker dengan subwoofer.' },
              { title: '3. Kontroler DSP Rainbow EL-PA4.6', markdown: 'Kontroler DSP digunakan untuk mempermudah pengoperasian serta pengaturan sistem sesuai kebutuhan pengguna.' },
              { title: '4. Power Mono Prototype Quarto', markdown: 'Power mono digunakan sebagai amplifier khusus untuk menggerakkan subwoofer. Amplifier khusus subwoofer membantu memberikan suplai tenaga yang sesuai untuk reproduksi frekuensi rendah.' },
              { title: '5. Subwoofer 10" Prototype Quarto', markdown: 'Subwoofer 10" digunakan untuk melengkapi frekuensi rendah yang tidak dapat dihasilkan secara optimal oleh speaker 4". Target: low bass lebih dalam, bass lebih berisi, impact lebih terasa, tekanan bass lebih kuat, bass tetap terkontrol, integrasi lebih baik dengan speaker utama.' }
            ]
          },
          {
            title: 'KONFIGURASI CHANNEL DSP',
            type: 'subsections',
            subsections: [
              { title: 'DSP 6 Channel', markdown: 'TIDAK BISA — Tidak mencukupi untuk konfigurasi 2-way aktif yang dibutuhkan.' },
              { title: 'DSP 8 Channel', markdown: 'Front: ON, Rear: OFF, Sub: ON — Konfigurasi ini menggunakan speaker Front sebagai sistem utama dengan dukungan Subwoofer.' },
              { title: 'DSP 10 Channel', markdown: 'Front: ON, Rear: ON, Sub: ON — Konfigurasi ini memungkinkan penggunaan Front, Rear dan Subwoofer secara aktif melalui DSP untuk mendapatkan sistem yang lebih lengkap di dalam kabin.' }
            ]
          },
          {
            title: 'B. KABEL, PILAR & BOX',
            type: 'list',
            items: [
              'BOX:',
              'Box kayu simple',
              'KABEL POWER:',
              'Kabel aki & ground 8 AWG (65/m × 9)',
              'Fuse Box ANL jepit 1 line',
              'Fuse Box ANL jepit 2 line',
              'Kabel remote (1 m × 5)',
              'KABEL SPEAKER & SIGNAL:',
              'Kabel speaker Front 16 AWG (15/m × 12)',
              'Kabel Sub 16 AWG (15/m × 4)',
              'Kabel input DSP 16 AWG (15/m × 10)',
              'RCA SQ 2.5 m',
              'PEREDAM:',
              'Peredam Gran Turismo (180/lbr × 3)'
            ]
          },
          {
            title: 'C. JASA INSTALASI & TUNING',
            type: 'list',
            items: [
              'Jasa instalasi',
              'Phase checker',
              'Selang flexible kabel aki ruang mesin',
              'Ring midbass + cat',
              'Pembesaran plat + anti karat',
              'Dudukan Fuse Box',
              'Klem kabel + solder + selang bakar',
              'Sealer kabel',
              'Plakban tarikan pintu & kisi AC',
              'Penutup cover stir',
              'Wrapping plastik untuk jok & interior'
            ]
          },
          {
            title: 'DSP SETTING & FINAL TUNING',
            type: 'markdown',
            markdown: 'Setelah seluruh perangkat selesai dipasang, dilakukan proses DSP setting dan final tuning.\n\nParameter yang disesuaikan meliputi: Crossover Front, Crossover Rear, Crossover Subwoofer, EQ, Level setiap channel, Gain, Phase, Time Alignment, Balance kiri dan kanan, Integrasi speaker dengan subwoofer, Staging, Imaging, Final listening adjustment.\n\nKarena speaker utama menggunakan ukuran 4", proses tuning menjadi bagian penting untuk mendapatkan keseimbangan antara vocal/detail dengan midbass dan low bass dari subwoofer.'
          },
          {
            title: 'TARGET HASIL SUARA',
            type: 'markdown',
            markdown: '**VOCAL** — Lebih jelas, fokus dan mudah dinikmati.\n\n**MIDRANGE** — Karakter 4" memberikan fokus pada area vocal dan midrange.\n\n**DETAIL** — Informasi musik lebih terdengar dengan artikulasi yang lebih jelas.\n\n**BASS** — Subwoofer 10" memberikan tambahan low bass yang lebih dalam dan berisi.\n\n**STAGING & IMAGING** — DSP membantu mengatur posisi dan keseimbangan suara agar panggung musik lebih terarah.\n\n**OVERALL BALANCE** — Speaker utama dan subwoofer diselaraskan melalui DSP agar bekerja sebagai satu sistem.'
          },
          {
            title: 'KEUNGGULAN PAKET RECOMMENDED',
            type: 'list',
            items: [
              'GZ Mercy GZCS 100.2 MB 2 Way 4"',
              'Jaring CNC Midrange sudah termasuk dari speaker',
              'Rainbow DSP EL-PA4.6',
              'Kontroler DSP',
              'Power Mono Prototype Quarto',
              'Subwoofer 10" Prototype Quarto',
              'Konfigurasi Front + Sub atau Front + Rear + Sub',
              'Crossover & EQ melalui DSP',
              'Time Alignment & Phase Adjustment',
              'Power khusus untuk subwoofer',
              'Low bass lebih dalam dengan subwoofer 10"',
              'Peredam Gran Turismo',
              'Phase checking',
              'Instalasi kabel dan kelistrikan yang rapi',
              'Final DSP tuning'
            ]
          }
        ],
        closingTagline: 'PAKET RECOMMENDED — GZ Mercy GZCS 100.2 MB + DSP + Power Mono + Sub 10"',
        closingComponents: ['GZ Mercy GZCS 100.2 MB', 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', 'Subwoofer 10" Prototype Quarto'],
        disclaimer: 'Harga non-diskon mengikuti harga yang tercantum pada brosur.'
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
