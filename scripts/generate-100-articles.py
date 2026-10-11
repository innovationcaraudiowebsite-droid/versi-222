#!/usr/bin/env python3
"""
Generate 100 articles about Innovation Car Audio Jakarta.

Format matches existing articles:
- Markdown with ## headers
- ~2000 chars per article
- Structure: Hook → Detail → Analysis → Recommendation
- Each article: title, slug, excerpt, content, 2 images, category, tags

Categories:
1. Speaker Reviews (20)
2. Amplifier & Power (10)
3. Subwoofer Reviews (10)
4. DSP & Tuning (15)
5. Paket Audio (15)
6. Peredam Suara (10)
7. Tips & Edukasi (10)
8. Brand Stories (5)
9. Event & Kontes (5)
"""
import json
import re
from pathlib import Path
from datetime import datetime, timedelta
import random

random.seed(42)  # Reproducible

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')

# ============================================================
# Image pool — assign based on keyword matching
# ============================================================
ARTICLE_IMAGES = [
    'cara-merawat-sistem-audio-mobil-awet-optimal.png',
    'innovation-car-audio-jakarta-20-tahun-sistem-audio-mobil.png',
    'jaring-cnc-midrange-detail-premium-instalasi-audio.png',
    'konfigurasi-dsp-6ch-8ch-10ch-mana-yang-dibutuhkan.png',
    'panduan-lengkap-dsp-rainbow-el-pa4-6-tuning-audio-mobil.png',
    'panduan-memilih-paket-audio-mobil-simple-entry-daily-ahe.png',
    'perbedaan-speaker-2-way-dan-3-way-audio-mobil.png',
    'peredam-gran-turismo-wajib-paket-audio-mobil.png',
    'review-blam-relax-165-rx-speaker-2-way-6-5-inch.png',
    'review-gz-radioactive-speaker-aktif-affordable-high-end.png',
    'review-infinity-alpha-650c-speaker-entry-level.png',
    'review-morel-maximo-6-speaker-israel-affordable-high-end.png',
    'review-phd-mf-6-1-kit-speaker-french-audio.png',
    'review-power-mono-prototype-quarto-amplifier-subwoofer.png',
    'review-rainbow-experience-line-el-c6-2-speaker-daily.png',
    'review-speaker-gz-mercy-gzcs-100-2-mb-2-way-4-inch.png',
    'review-subwoofer-phd-8-inch-premium-bawah-jok-bagasi.png',
    'review-zevox-zv-8-sas-subwoofer-compact-bawah-jok.png',
    'subwoofer-bawah-jok-vs-bagasi-perbandingan.png',
    'subwoofer-quarto-10-vs-cresscendo-10-perbandingan.png',
    'tips-instalasi-audio-mobil-sebelum-upgrade.png',
]

LANDING_IMAGES = [
    'paket-4-pintu.png', 'paket-full-kabin.png',
    'paket-kap-mesin.png', 'paket-wheel-housing.png',
    'bahan-butyl.png', 'bahan-absorber.png',
    'bahan-nex.png', 'bahan-spant.png',
]

GALLERY_IMAGES = [
    'slide-1.png', 'slide-2.png', 'slide-3.png', 'slide-4.png',
    'bawahslide-1.png', 'bawahslide-2.png', 'bawahslide-3.png',
    'bawahslide-4.png', 'bawahslide-5.png',
]


def pick_images(title, content):
    """Pick 2 most relevant images based on title/content keywords."""
    text = (title + ' ' + content).lower()
    scored = []

    for img in ARTICLE_IMAGES:
        img_low = img.lower()
        score = 0
        # Keyword matching
        if 'speaker' in text and 'speaker' in img_low: score += 5
        if 'subwoofer' in text and 'subwoofer' in img_low: score += 5
        if 'dsp' in text and 'dsp' in img_low: score += 5
        if 'peredam' in text and 'peredam' in img_low: score += 5
        if 'paket' in text and 'paket' in img_low: score += 5
        if 'amplifier' in text and ('amplifier' in img_low or 'power' in img_low): score += 5
        if '2-way' in text and '2-way' in img_low: score += 3
        if '3-way' in text and '3-way' in img_low: score += 3
        if 'morel' in text and 'morel' in img_low: score += 10
        if 'phd' in text and 'phd' in img_low: score += 10
        if 'gz' in text and 'gz' in img_low: score += 8
        if 'blam' in text and 'blam' in img_low: score += 10
        if 'rainbow' in text and 'rainbow' in img_low: score += 10
        if 'infinity' in text and 'infinity' in img_low: score += 10
        if 'crescendo' in text and 'cresscendo' in img_low: score += 10
        if 'zevox' in text and 'zevox' in img_low: score += 10
        if 'quarto' in text and 'quarto' in img_low: score += 10
        if 'cnc' in text and 'cnc' in img_low: score += 8
        if 'mercy' in text and 'mercy' in img_low: score += 10
        if 'instalasi' in text and 'instalasi' in img_low: score += 5
        if 'tuning' in text and 'tuning' in img_low: score += 5
        if 'perawatan' in text or 'merawat' in text and 'merawat' in img_low: score += 8
        if 'tips' in text and 'tips' in img_low: score += 5
        if 'entry' in text and 'entry' in img_low: score += 5
        if 'daily' in text and 'daily' in img_low: score += 5
        if 'affordable' in text and 'affordable' in img_low: score += 5
        scored.append((score, f'/article-images/{img}'))

    # Also consider landing images for peredam topics
    for img in LANDING_IMAGES:
        img_low = img.lower()
        score = 0
        if 'peredam' in text and 'bahan' in img_low: score += 5
        if 'paket' in text and 'paket' in img_low: score += 5
        scored.append((score, f'/landing-img/{img}'))

    # Also consider gallery for workshop/install topics
    for img in GALLERY_IMAGES:
        score = 2  # gallery images are generic, low priority
        if 'workshop' in text or 'instalasi' in text: score += 3
        scored.append((score, f'/gallery/{img}'))

    # Sort by score descending, pick top 2
    scored.sort(reverse=True, key=lambda x: x[0])
    top2 = [img for _, img in scored[:2] if _ > 0]

    # If less than 2 matched, fill from general pool
    if len(top2) < 2:
        for _, img in scored:
            if img not in top2:
                top2.append(img)
            if len(top2) >= 2:
                break

    return top2[:2]


def slugify(text):
    """Convert title to URL-friendly slug."""
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    s = s.strip('-')
    return s


# ============================================================
# 100 Article definitions
# Format: (title, category, excerpt, content_markdown)
# Content is ~2000 chars, markdown with ## headers
# ============================================================

ARTICLES = []

# ---- Category 1: Speaker Reviews (20 articles) ----
SPEAKER_REVIEWS = [
    ("Review Morel Maximo 6: Speaker Israel yang Natural untuk Affordable High End",
     "peredam-mobil",
     "Morel Maximo 6 speaker 2 Way 6.5 inch dari Israel dengan karakter suara natural dan warm untuk tier Normal Affordable High End.",
     """## Speaker Israel yang Bikin Suara Terasa Lebih Natural

Morel adalah brand audio dari Israel yang dikenal di kalangan audiophile dunia. Maximo 6 adalah speaker 2 Way 6.5" yang diposisikan sebagai tier Normal di kategori Affordable High End di Innovation Car Audio Jakarta.

## Spesifikasi Morel Maximo 6

- **Konfigurasi:** 2 Way 6.5" Pasif
- **Origin:** Israel
- **Karakter:** Natural, warm vocal, smooth midbass
- **Tier:** Normal di Affordable High End
- **Best paired with:** DSP Rainbow + Power Mono + Subwoofer

## Karakter Suara

### Vocal — Natural & Warm
Morel terkenal dengan karakter vocal yang natural dan warm. Suara terasa hidup dan tidak artifisial. Vocal tidak terlalu forward, terasa relaxed tapi tetap detail.

### Midbass — Smooth & Full
Midbass smooth dan full. Body suara yang kaya tanpa terasa berantakan. Integrasi dengan subwoofer sangat halus.

### Treble — Soft & Refined
Treble soft dan refined. Tidak bright, sangat nyaman untuk sesi dengar panjang. Detail tetap ada tapi tidak menusuk telinga.

## Mengapa Morel sebagai Tier Normal?

1. Karakter natural yang cocok untuk semua genre musik
2. Brand terpercaya di dunia audiophile internasional
3. Kualitas di atas PHD, di bawah GZ RadioActive
4. Harga sweet spot untuk kategori Affordable High End

## Siapa yang Cocok?

- Yang suka suara natural dan tidak fatiguing
- Pendengar yang prioritaskan vocal clarity
- Mencari speaker daily use dengan kualitas premium
- Budget Affordable High End tier Normal

## Kesimpulan

Morel Maximo 6 adalah pilihan solid untuk yang mencari karakter suara natural Israel dengan harga terjangkau di kategori AHE."""),

    ("Review PHD MF 6.1 Kit: Speaker French Audio dengan Vocal yang Elegant",
     "peredam-mobil",
     "PHD MF 6.1 Kit 2 Way 6.5 inch dari Prancis dengan karakter vocal elegant dan smooth untuk tier Basic Affordable High End.",
     """## Speaker Prancis dengan Karakter Elegant

PHD Audio adalah brand asal Prancis yang sudah lama dipercaya di dunia car audio. MF 6.1 Kit adalah speaker 2 Way 6.5" yang diposisikan sebagai tier Basic di kategori Affordable High End di Innovation Car Audio Jakarta.

## Spesifikasi PHD MF 6.1 Kit

- **Konfigurasi:** 2 Way 6.5" Pasif
- **Origin:** Prancis
- **Karakter:** Elegant vocal, smooth midbass, refined treble
- **Tier:** Basic di Affordable High End
- **Best paired with:** DSP Rainbow EL-PA4.6 + Power Mono

## Karakter Suara

### Vocal — Elegant & Smooth
PHD terkenal dengan karakter vocal yang elegant. Suara terasa sophisticated dan refined. Vocal forward tapi tidak agresif, sangat cocok untuk musik jazz dan vocal.

### Midbass — Controlled & Tight
Midbass controlled dan tight. Tidak boomy, sangat disiplin. Body suara yang pas tanpa berlebihan.

### Treble — Refined & Clean
Treble refined dan clean. Detail cukup baik tanpa terasa harsh. Sangat nyaman untuk sesi dengar panjang.

## PHD vs Lainnya di AHE

| Brand | Karakter | Tier di AHE |
|-------|----------|-------------|
| PHD | Elegant & smooth | Basic |
| Morel | Natural & warm | Normal |
| GZ RadioActive | Detail & aktif | Best Buy |
| GZ Mercy | Fokus vocal + CNC | Recommended |

## Siapa yang Cocok?

- Pencinta musik jazz dan vocal
- Yang suka karakter suara elegant dan sophisticated
- Mencari entry point Affordable High End
- Budget AHE tier Basic

## Kesimpulan

PHD MF 6.1 Kit adalah pilihan tepat untuk masuk kategori AHE dengan karakter suara Prancis yang elegant dan harga yang masih terjangkau."""),

    ("Review GZ Mercy GZCS 100.2: Speaker 4 Inch dengan CNC Midrange Premium",
     "peredam-mobil",
     "GZ Mercy GZCS 100.2 MB speaker 2 Way 4 inch dengan CNC midrange detail premium untuk tier Recommended Affordable High End.",
     """## Ground Zero Mercy dengan CNC Midrange

Ground Zero Mercy GZCS 100.2 MB adalah speaker 2 Way 4 inch yang diposisikan sebagai tier Recommended di kategori Affordable High End. Keunikan speaker ini adalah penggunaan CNC midrange yang memberikan detail suara premium.

## Spesifikasi GZ Mercy GZCS 100.2

- **Konfigurasi:** 2 Way 4" Pasif
- **Origin:** Jerman
- **Karakter:** Fokus vocal, CNC midrange detail
- **Tier:** Recommended di Affordable High End
- **Special:** CNC machined midrange driver

## Karakter Suara

### Vocal — Detail & Fokus
CNC midrange memberikan karakter vocal yang sangat detail dan fokus. Suara terasa presisi dan terarah. Vocal terasa dekat dan intimate.

### Midrange — CNC Precision
Midrange CNC machined memberikan detail yang tidak bisa didapat dari speaker konvensional. Setiap nuansa vocal terdengar jelas.

### Treble — Clean & Extended
Treble clean dan extended. Detail tinggi yang sangat baik tanpa terasa harsh atau sibilant.

## Mengapa GZ Mercy sebagai Tier Recommended?

1. CNC midrange memberikan detail premium
2. Brand Jerman dengan reputasi kuat
3. Konfigurasi 4 inch cocok untuk instalasi custom
4. Kualitas suara di atas tier Normal dan Best Buy

## Siapa yang Cocok?

- Audiophile yang mencari detail maksimal
- Yang suka konfigurasi 3 Way dengan speaker 4 inch
- Mencari tier tertinggi di AHE
- Budget AHE tier Recommended

## Kesimpulan

GZ Mercy GZCS 100.2 MB adalah pilihan premium di AHE dengan CNC midrange yang memberikan detail suara yang sulit ditandingi speaker konvensional."""),

    ("Review GZ RadioActive: Speaker Aktif dengan Detail yang Menggugah",
     "peredam-mobil",
     "GZ RadioActive speaker aktif dengan karakter detail dan aktif untuk tier Best Buy Affordable High End.",
     """## Ground Zero RadioActive — Speaker Aktif Premium

Ground Zero RadioActive adalah speaker aktif yang diposisikan sebagai tier Best Buy di kategori Affordable High End. Speaker aktif berarti sudah memiliki amplifier built-in.

## Spesifikasi GZ RadioActive

- **Konfigurasi:** Speaker Aktif (built-in amplifier)
- **Origin:** Jerman
- **Karakter:** Detail, aktif, dynamic
- **Tier:** Best Buy di Affordable High End
- **Special:** Active design, no external amp needed

## Karakter Suara

### Vocal — Detail & Dynamic
RadioActive memberikan karakter vocal yang detail dan dynamic. Suara terasa hidup dan energik. Vocal forward dengan detail yang menggugah.

### Midbass — Punchy & Controlled
Midbass punchy dan controlled. Attack yang kuat tanpa terasa boomy. Sangat cocok untuk musik dengan beat cepat.

### Treble — Extended & Airy
Treble extended dan airy. Detail tinggi yang sangat baik memberikan sense of space dan openness.

## Keunggulan Speaker Aktif

1. Tidak perlu amplifier eksternal
2. Matching perfect antara driver dan amp
3. Instalasi lebih simple
4. DSP tuning lebih mudah

## Siapa yang Cocok?

- Yang mau instalasi simple tanpa amplifier eksternal
- Mencari value terbaik di AHE (Best Buy)
- Suka karakter suara detail dan dynamic
- Budget AHE tier Best Buy

## Kesimpulan

GZ RadioActive adalah value champion di AHE dengan konsep speaker aktif yang memberikan kemudahan instalasi dan kualitas suara yang menggugah."""),

    ("Review Blam Relax 165 RX: Speaker Prancis 2 Way 6.5 Inch untuk Daily Use",
     "peredam-mobil",
     "Blam Relax 165 RX speaker 2 Way 6.5 inch dari Prancis dengan karakter relaxed untuk daily use di kategori Daily Use.",
     """## Blam Relax — Speaker Prancis untuk Daily Use

Blam adalah brand audio asal Prancis yang dikenal dengan karakter suara relaxed dan comfortable. Relax 165 RX adalah speaker 2 Way 6.5" untuk kategori Daily Use di Innovation Car Audio.

## Spesifikasi Blam Relax 165 RX

- **Konfigurasi:** 2 Way 6.5" Pasif
- **Origin:** Prancis
- **Karakter:** Relaxed, comfortable, smooth
- **Kategori:** Daily Use
- **Best paired with:** DSP + amplifier 4 channel

## Karakter Suara

### Vocal — Relaxed & Comfortable
Blam Relax memberikan karakter vocal yang relaxed dan comfortable. Tidak fatiguing untuk sesi dengar panjang. Vocal terasa smooth dan easy-going.

### Midbass — Warm & Full
Midbass warm dan full. Body suara yang kaya tanpa agresif. Cocok untuk musik pop dan slow jam.

### Treble — Smooth & Easy
Treble smooth dan easy. Tidak bright, sangat nyaman. Detail cukup untuk daily listening.

## Mengapa Blam untuk Daily Use?

1. Karakter relaxed cocok untuk daily listening
2. Brand Prancis dengan kualitas konsisten
3. Harga terjangkau untuk kategori Daily Use
4. Mudah di-drive, tidak butuh amplifier besar

## Siapa yang Cocok?

- Yang mau speaker daily use comfortable
- Tidak suka suara yang fatiguing
- Budget Daily Use category
- Mencari karakter suara Prancis yang smooth

## Kesimpulan

Blam Relax 165 RX adalah pilihan tepat untuk daily use dengan karakter suara Prancis yang relaxed dan comfortable untuk dengar harian tanpa lelah."""),
]

# I'll continue with more articles below...
# For efficiency, I'll generate the rest programmatically

# ---- Category 2: Amplifier & Power (10 articles) ----
AMPLIFIER_REVIEWS = [
    ("Review Power Mono Prototype Quarto: Amplifier Subwoofer Premium",
     "audio-mobil",
     "Power Mono Prototype Quarto amplifier khusus subwoofer dengan kualitas premium untuk reproduksi bass yang powerful dan controlled.",
     """## Power Mono untuk Subwoofer Premium

Prototype Quarto Power Mono adalah amplifier khusus untuk menggerakkan subwoofer. Dirancang dengan fokus pada reproduksi frekuensi rendah yang powerful dan controlled.

## Spesifikasi Power Mono Prototype Quarto

- **Tipe:** Mono block amplifier
- **Fungsi:** Khusus subwoofer
- **Karakter:** Powerful, controlled, tight bass
- **Kategori:** Affordable High End
- **Best paired with:** Subwoofer 10 inch Quarto

## Karakter Suara

### Bass — Powerful & Controlled
Power Mono Quarto memberikan bass yang powerful dan controlled. Attack yang kuat, decay yang cepat. Bass terdengar punchy dan tight.

### Control — Excellent Damping
Damping factor yang tinggi memberikan control yang excellent terhadap subwoofer. Bass tidak boomy, sangat disiplin.

### Power Output — Sufficient Headroom
Power output yang cukup memberikan headroom untuk dynamic passages. Tidak terasa clipped saat volume tinggi.

## Mengapa Power Mono Khusus Subwoofer?

1. Desain Class D efisien untuk frekuensi rendah
2. Power besar di channel tunggal
3. Damping factor tinggi untuk control bass
4. Tidak boros listrik

## Siapa yang Cocok?

- Yang pakai subwoofer 10 inch Quarto
- Mencari bass yang powerful dan controlled
- Budget AHE dengan Power Mono
- Suka karakter bass punchy

## Kesimpulan

Power Mono Prototype Quarto adalah pairing perfect untuk Subwoofer 10 inch Quarto, memberikan bass yang powerful dan controlled di kategori AHE."""),
]

# ---- Category 3: Subwoofer Reviews (10 articles) ----
SUBWOOFER_REVIEWS = [
    ("Review Subwoofer PHD 8 Inch: Compact Premium untuk Bawah Jok",
     "peredam-mobil",
     "Subwoofer PHD 8 inch compact premium untuk instalasi bawah jok dengan kualitas bass yang solid.",
     """## Subwoofer Compact untuk Bawah Jok

PHD 8 inch subwoofer adalah pilihan compact premium untuk instalasi bawah jok. Memberikan bass yang solid tanpa mengorbankan ruang kabin.

## Spesifikasi Subwoofer PHD 8 Inch

- **Ukuran:** 8 inch
- **Origin:** Prancis
- **Instalasi:** Bawah jok (underseat)
- **Karakter:** Tight, punchy, controlled
- **Kategori:** Affordable High End

## Karakter Suara

### Bass — Tight & Punchy
PHD 8 inch memberikan bass yang tight dan punchy. Tidak boomy karena ukuran compact. Bass terasa quick dan responsive.

### Low Bass — Sufficient Extension
Untuk ukuran 8 inch, low bass extension cukup baik. Tidak sedalam 10 atau 12 inch, tapi cukup untuk daily use.

### Integration — Smooth dengan Speaker
Integrasi dengan speaker utama sangat smooth. Crossover transition halus tanpa gap.

## Bawah Jok vs Bagasi

| Aspek | Bawah Jok (8") | Bagasi (10-12") |
|-------|----------------|------------------|
| Bass depth | Cukup | Lebih dalam |
| Space saving | Excellent | Mengurangi bagasi |
| Installation | Lebih mudah | Lebih kompleks |
| Sound stage | Lebih dekat | Lebih jauh |

## Siapa yang Cocok?

- Yang tidak mau kehilangan ruang bagasi
- Mencari bass compact untuk daily use
- Instalasi hidden di bawah jok
- Budget AHE dengan subwoofer 8 inch

## Kesimpulan

PHD 8 inch subwoofer adalah solusi compact premium untuk bass yang solid tanpa mengorbankan ruang bagasi."""),
]

# ---- Category 4: DSP & Tuning (15 articles) ----
DSP_ARTICLES = [
    ("Panduan Lengkap DSP Rainbow EL-PA4.6: Tuning Audio Mobil Profesional",
     "audio-mobil",
     "Panduan lengkap DSP Rainbow EL-PA4.6 untuk tuning audio mobil profesional termasuk crossover, EQ, time alignment, dan phase.",
     """## DSP Rainbow EL-PA4.6 — Pusat Tuning Audio Mobil

DSP Rainbow EL-PA4.6 adalah perangkat tuning utama di Innovation Car Audio Jakarta. DSP memungkinkan pengaturan presisi sistem audio untuk hasil yang optimal.

## Fungsi DSP Rainbow EL-PA4.6

- **Crossover:** Pemisahan frekuensi antar speaker
- **EQ:** Equalizer parametrik untuk koreksi respons
- **Time Alignment:** Penyesuaian waktu tiba suara
- **Phase:** Polaritas speaker
- **Level & Gain:** Matching volume antar channel

## Konfigurasi Channel DSP

### DSP 6 Channel
- Front: ON, Rear: OFF, Sub: ON
- Cocok untuk: Sistem 2 Way + Subwoofer

### DSP 8 Channel
- Front: ON, Rear: OFF, Sub: ON
- Cocok untuk: Front + Subwoofer fokus

### DSP 10 Channel
- Front: ON, Rear: ON, Sub: ON
- Cocok untuk: Sistem lengkap dengan rear fill

## Tips Tuning DSP

1. **Mulai dari crossover:** Set high-pass untuk speaker, low-pass untuk sub
2. **Time alignment:** Ukur jarak setiap speaker ke telinga listener
3. **EQ:** Koreksi peak dan dip di respons frekuensi
4. **Phase:** Cek polarity untuk integrasi subwoofer
5. **Level matching:** Samakan volume antar speaker

## Hasil Tuning yang Baik

- Vocal terpusat di dashboard
- Sound stage lebar dan tinggi
- Bass terintegrasi smooth dengan midbass
- Tidak ada peak yang mengganggu

## Kesimpulan

DSP Rainbow EL-PA4.6 adalah tool wajib untuk tuning audio mobil profesional. Hasil tuning yang baik memberikan pengalaman dengar yang jauh lebih baik dari speaker original."""),

    ("Konfigurasi DSP 6 Channel vs 8 Channel vs 10 Channel: Mana yang Dibutuhkan?",
     "audio-mobil",
     "Perbandingan konfigurasi DSP 6, 8, dan 10 channel untuk sistem audio mobil dengan analisa kebutuhan masing-masing.",
     """## Pilih Channel DSP Sesuai Kebutuhan

DSP untuk audio mobil tersedia dalam berbagai konfigurasi channel. Pemilihan channel yang tepat menentukan kompleksitas sistem dan hasil tuning.

## DSP 6 Channel — Entry Level Active

### Konfigurasi
- Front: ON, Rear: OFF, Sub: ON
- 2 channel front active + 2 channel sub

### Cocok untuk
- Sistem 2 Way front + subwoofer
- Budget terbatas tapi mau tuning aktif
- Mobil kecil tidak butuh rear fill

## DSP 8 Channel — Mid Level Active

### Konfigurasi
- Front: ON, Rear: OFF, Sub: ON
- 4 channel front active + 2 channel sub

### Cocok untuk
- Sistem 3 Way front + subwoofer
- Mencari detail lebih dari 6 channel
- Front stage sebagai fokus utama

## DSP 10 Channel — High End Active

### Konfigurasi
- Front: ON, Rear: ON, Sub: ON
- 4 channel front + 4 channel rear + 2 sub

### Cocok untuk
- Sistem lengkap dengan rear fill
- Sistem competition grade
- Mencari surround sound experience

## Tabel Perbandingan

| Channel | Front | Rear | Sub | Kompleksitas |
|---------|-------|------|-----|--------------|
| 6 ch | Active 2 way | Off | 1 sub | Low |
| 8 ch | Active 3 way | Off | 1 sub | Medium |
| 10 ch | Active | Active | 1-2 sub | High |

## Cara Memilih

1. **Tentukan konfigurasi speaker:** 2 Way atau 3 Way?
2. **Apakah butuh rear fill?** Jika ya, pilih 10 channel
3. **Budget tuning:** Lebih banyak channel = tuning lebih lama
4. **Mekanik experience:** Pastikan teknisi mampu tune channel tersebut

## Kesimpulan

Pemilihan channel DSP harus sesuai konfigurasi speaker dan kebutuhan. Tidak selalu lebih banyak channel = lebih baik. Yang penting matching dengan sistem dan kemampuan tuning teknisi."""),
]

# ---- Category 5: Paket Audio (15 articles) ----
PAKET_ARTICLES = [
    ("Panduan Memilih Paket Audio Mobil: Simple, Entry, Daily Use, atau AHE?",
     "audio-mobil",
     "Panduan lengkap memilih paket audio mobil antara Simple Upgrade, Entry, Daily Use, dan Affordable High End sesuai kebutuhan dan budget.",
     """## 4 Kategori Paket Audio Mobil di Innovation Car Audio

Innovation Car Audio Jakarta menyediakan 4 kategori paket audio mobil dengan tingkatan berbeda, dari entry level hingga premium audiophile.

## 1. Simple Upgrade (Rp 3.3jt - 9.3jt)

### Cocok untuk
- Pemula yang baru upgrade dari speaker original
- Budget terbatas tapi mau perbaikan signifikan
- Mobil harian dengan sound basic

### Isi paket
- Speaker 2 way aftermarket
- Plug and play tanpa amplifier
- Tanpa DSP tuning
- Instalasi cepat 4-6 jam

## 2. Entry (Rp 10jt - 26.6jt)

### Cocok untuk
- Yang mau upgrade lebih serious
- Mulai pakai amplifier dan DSP
- Mencari kualitas di atas average

### Isi paket
- Speaker 2 way atau 3 way
- Amplifier 4 channel
- DSP tuning basic
- Subwoofer bawah jok atau bagasi
- Instalasi 6-8 jam

## 3. Daily Use (Rp 21.7jt - 54jt)

### Cocok untuk
- Daily driver dengan kualitas premium
- Mencari comfort untuk dengar harian
- Budget mid-range

### Isi paket
- Speaker premium 2 way atau 3 way
- Amplifier 4-5 channel
- DSP tuning professional
- Subwoofer 8-10 inch
- Instalasi 8-10 jam

## 4. Affordable High End (Rp 31jt - 80jt)

### Cocok untuk
- Audiophile dengan budget premium
- Mencari kualitas competition grade
- Willing to invest untuk suara terbaik

### Isi paket
- Speaker premium brand Eropa
- Power mono untuk subwoofer
- DSP tuning detail
- Subwoofer 10 inch Quarto
- Instalasi 10-12 jam dengan final tuning

## Cara Memilih

1. **Tentukan budget:** Berapa maksimal yang siap dikeluarkan?
2. **Identifikasi kebutuhan:** Daily use atau competition?
3. **Konsultasi:** Chat WhatsApp untuk rekomendasi spesifik
4. **Test dengar:** Datang ke workshop untuk demo

## Kesimpulan

Pemilihan paket harus sesuai budget dan kebutuhan. Tidak perlu paksa AHE kalau daily use sudah cukup. Yang penting dapat value sesuai budget."""),
]

# ---- Category 6: Peredam Suara (10 articles) ----
PEREDAM_ARTICLES = [
    ("Peredam Suara Mobil: Panduan Lengkap Bahan Butyl, Absorber, Nex, dan Spant",
     "peredam-mobil",
     "Panduan lengkap jenis bahan peredam suara mobil: Butyl, Absorber, Nex, dan Spant dengan fungsi dan aplikasi masing-masing.",
     """## 4 Jenis Bahan Peredam Suara Mobil

Peredam suara mobil bukan satu jenis bahan. Ada 4 jenis bahan dengan fungsi berbeda yang dipakai di Innovation Car Audio Jakarta.

## 1. Peredam Butyl

### Fungsi
- Menambah mass loading ke panel logam
- Mengurangi resonansi panel
- Mencegah bunyi bergetar

### Aplikasi
- Pintu (door panel)
- Kap mesin (hood)
- Floorboard
- Wheel housing

### Karakter
- Sticky dan berat
- Tidak bersifat absorber
- Bekerja dengan menambah mass

## 2. Peredam Absorber

### Fungsi
- Menyerap gelombang suara
- Mengurangi echo di kabin
- Meningkatkan clarity audio

### Aplikasi
- Door trim (inner)
- Floor carpet
- Roof headliner
- Bagasi

### Karakter
- Bahan foam atau fiber
- Ringan tapi tebal
- Bekerja menyerap suara

## 3. Peredam Nex

### Fungsi
- Barrier terhadap panas
- Mengurangi noise dari luar
- Combo dengan butyl untuk hasil maksimal

### Aplikasi
- Firewall (bulkhead mesin)
- Floorboard bawah
- Transmisi tunnel

### Karakter
- Bahan aluminum foil
- Reflective terhadap panas
- Juga sebagai sound barrier

## 4. Peredam Spant

### Fungsi
- Combines mass loading dan absorption
- Multi-layer construction
- Premium solution

### Aplikasi
- Premium installation
- Competition grade
- Total kabin treatment

### Karakter
- Multi-layer
- Premium price
- Hasil paling komprehensif

## Paket Peredam Innovation Car Audio

### Paket 4 Pintu (Rp 1-2jt)
- Butyl di door panel luar
- Absorber di door trim

### Paket Full Kabin (Rp 5-10jt)
- Butyl + Absorber di seluruh kabin
- Nex di firewall
- Floor dan roof

### Paket Kap Mesin (Rp 1-2jt)
- Butyl di hood
- Nex sebagai heat barrier

## Kesimpulan

Kombinasi 4 jenis bahan peredam memberikan hasil terbaik. Tidak cukup satu jenis saja. Konsultasi dengan teknisi untuk paket yang sesuai kebutuhan."""),
]

# ---- Category 7: Tips & Edukasi (10 articles) ----
TIPS_ARTICLES = [
    ("Cara Merawat Sistem Audio Mobil: 10 Tips agar Awet dan Optimal",
     "audio-mobil",
     "10 tips merawat sistem audio mobil agar awet dan optimal performanya dari teknisi berpengalaman Innovation Car Audio Jakarta.",
     """## 10 Tips Merawat Sistem Audio Mobil

Sistem audio mobil yang sudah di-upgrade butuh perawatan agar tetap awet dan optimal. Berikut 10 tips dari teknisi Innovation Car Audio Jakarta.

## 1. Jangan Volume Maksimal Saat Baru Start

Tunggu 5-10 menit setelah mesin hidup sebelum volume tinggi. Speaker butuh warming up agar voice coil tidak stress.

## 2. Bersihkan Speaker Grill Secara Berkala

Debu dan kotoran di speaker grill bisa masuk ke cone speaker. Bersihkan dengan soft brush setiap 2-3 bulan.

## 3. Cek Koneksi Kabel

Koneksi kabel yang longgar bisa menyebabkan noise dan putus suara. Cek setiap 6 bulan atau saat service audio.

## 4. Hindari Air di Speaker

Jangan semprot air langsung ke speaker saat cuci mobil. Pakai lap basah untuk area speaker.

## 5. Setting EQ dengan Benar

EQ yang tidak tepat bisa merusak speaker. Jangan boost bass maksimal jika speaker tidak capable.

## 6. Pakai DSP Preset

Simpan preset DSP untuk genre musik berbeda. Hindari ubah setting saat driving.

## 7. Cek Amplifier Ventilation

Pastikan ventilation amplifier tidak tertutup. Overheating bisa merusak amplifier.

## 8. Subwoofer Warm Up

Subwoofer butuh warm up 10-15 menit sebelum volume tinggi. Bass heavy track bisa merusak subwoofer cold.

## 9. Service Berkala 6 Bulan

Bawa ke workshop untuk check menyeluruh setiap 6 bulan. Cek koneksi, clean speaker, verify DSP settings.

## 10. Hindari Distortion

Jika dengar distortion, turunkan volume. Distortion adalah tanda speaker overdriven yang bisa rusak.

## Tanda Sistem Audio Bermasalah

- Suara berdesis atau noise
- Distortion di volume tertentu
- Speaker bergetar tidak normal
- Bass lemah atau boomy
- Amplifier overheat

## Kesimpulan

Perawatan rutin adalah kunci sistem audio mobil awet. Investasi kecil untuk maintenance mencegah kerusakan besar. Konsultasi gratis di Innovation Car Audio Jakarta."""),
]

# ---- Category 8: Brand Stories (5 articles) ----
BRAND_STORIES = [
    ("Sejarah Ground Zero Audio: Brand Jerman yang Jadi Favorit Audiophile",
     "audio-mobil",
     "Sejarah Ground Zero Audio brand Jerman yang menjadi favorit audiophile di seluruh dunia termasuk Indonesia.",
     """## Ground Zero Audio — Brand Jerman dengan Reputasi Kuat

Ground Zero Audio adalah brand audio mobil asal Jerman yang telah menjadi favorit audiophile di seluruh dunia, termasuk Indonesia. Innovation Car Audio Jakarta adalah authorized dealer Ground Zero.

## Sejarah Ground Zero

Ground Zero didirikan di Jerman dengan fokus pada car audio quality. Brand ini dikenal dengan produk-produk inovatif seperti:

- **GZ RadioActive:** Speaker aktif dengan amplifier built-in
- **GZ Mercy:** Speaker premium dengan CNC midrange
- **GZ Subwoofer:** Subwoofer 10 dan 12 inch berkualitas

## Filosofi Ground Zero

Ground Zero percaya bahwa car audio harus:
1. **Detail:** Setiap nuansa musik harus terdengar
2. **Dynamic:** Suara harus hidup dan energik
3. **Build Quality:** Material premium dengan konstruksi solid
4. **Value:** Harga sebanding dengan kualitas

## Produk Unggulan Ground Zero

### GZ RadioActive
Speaker aktif dengan amp built-in. Cocok untuk yang mau instalasi simple tapi kualitas premium.

### GZ Mercy GZCS 100.2 MB
Speaker 4 inch dengan CNC midrange. Detail premium untuk audiophile yang mencari presisi.

### GZ Subwoofer
Subwoofer 10 dan 12 inch dengan karakter bass powerful dan controlled.

## Ground Zero di Innovation Car Audio

Sebagai authorized dealer, Innovation Car Audio Jakarta menyediakan:
- Produk 100% original
- Garansi resmi
- Tuning oleh teknisi bersertifikat
- Demo unit untuk test dengar

## Testimoni Pelanggan

Banyak pelanggan Innovation Car Audio memilih Ground Zero karena:
- Karakter suara detail sesuai selera audiophile
- Build quality Jerman yang solid
- Harga competitive di kelasnya
- Track record 559+ piala kontes audio

## Kesimpulan

Ground Zero Audio adalah brand yang layak dipertimbangkan untuk upgrade audio mobil. Reputasi Jerman dan kualitas premium menjadikannya pilihan favorit audiophile Indonesia."""),
]

# ---- Category 9: Event & Kontes (5 articles) ----
EVENT_ARTICLES = [
    ("Innovation Car Audio Raih 559+ Piala: Track Record Championship EMMA dan USACI",
     "audio-mobil",
     "Innovation Car Audio Jakarta raih 559+ piala di berbagai kontes audio termasuk EMMA dan USACI sebagai bukti kualitas.",
     """## 559+ Piala — Bukti Komitmen Kualitas

Innovation Car Audio Jakarta telah meraih 559+ piala di berbagai kontes audio mobil. Track record ini menjadi bukti komitmen terhadap kualitas.

## Kontes yang Diikuti

### EMMA (European Mobile Media Association)
- Asia Champion EMMA
- Champion of the Year EMMA
- Champion EMMA Asia
- Asian Pro Cup EMMA
- EMMA Best Sound Quality from IHEAC

### USACI
- USACI Championship
- National Champion

### Lainnya
- MURI SPL Recipient
- EURO STAR Award 2019-2025
- King of Sound Indonesia
- Juara Kontes Audio nasional

## Filosofi Kontes

Innovation Car Audio mengikuti kontes bukan untuk piala, tapi untuk:
1. **Validasi kualitas:** Bukti sistem audio kami competition grade
2. **Continuous improvement:** Belajar dari setiap kontes
3. **Industry networking:** Berbagi knowledge dengan komunitas
4. **Customer trust:** Track record yang bisa diverifikasi

## Persiapan Kontes

Setiap kontes audio butuh persiapan:
- **Tuning DSP:** Detail optimization untuk kategori tertentu
- **Speaker matching:** Pilih speaker sesuai kategori kontes
- **Install quality:** Instalasi rapi tanpa noise
- **Sound staging:** Imaging dan staging yang presisi

## Apa yang Dipelajari dari Kontes?

1. Setiap judge punya kriteria berbeda
2. Detail kecil bisa menentukan menang kalah
3. Instalasi quality sama pentingnya dengan equipment
4. DSP tuning adalah skill yang terus berkembang

## Manfaat untuk Pelanggan

Track record kontes memberikan manfaat:
- **Confidence:** Pelanggan tahu kami serius
- **Quality assurance:** Standar competition grade
- **Innovation:** Selalu update dengan teknologi terbaru
- **Network:** Akses ke produk dan technique terbaru

## Kesimpulan

559+ piala bukan cuma angka, tapi bukti komitmen Innovation Car Audio terhadap kualitas. Setiap piala adalah validasi bahwa sistem yang kami install adalah competition grade."""),
]

# Combine all articles
ALL_TOPICS = (
    SPEAKER_REVIEWS +
    AMPLIFIER_REVIEWS +
    SUBWOOFER_REVIEWS +
    DSP_ARTICLES +
    PAKET_ARTICLES +
    PEREDAM_ARTICLES +
    TIPS_ARTICLES +
    BRAND_STORIES +
    EVENT_ARTICLES
)

print(f"Defined {len(ALL_TOPICS)} articles so far. Need 100 total.")
print(f"Need to generate {100 - len(ALL_TOPICS)} more articles programmatically.")
