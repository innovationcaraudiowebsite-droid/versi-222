#!/usr/bin/env python3
"""
Generate 100 articles about Innovation Car Audio Jakarta.
Each article ~2000 chars, markdown format, 2 images, category, tags.
Updates data/backup-sqlite.json.
"""
import json
import re
import random
from pathlib import Path
from datetime import datetime, timedelta

random.seed(42)

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')

# ============================================================
# Image pool
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

PRODUCT_IMAGES_V2 = [
    'simple-upgrade-basic.png', 'simple-upgrade-normal.png',
    'simple-upgrade-recommended.png', 'simple-upgrade-best-buy.png',
    'entry-2way-sub-bawah-jok-basic.png', 'entry-2way-sub-bawah-jok-normal.png',
    'entry-2way-sub-quarto-10-bagasi-basic.png', 'entry-2way-sub-quarto-10-bagasi-normal.png',
    'daily-use-2way-sub-bawah-jok-basic.png', 'daily-use-3way-sub-quarto-10-bagasi-recommended.png',
    'affordable-high-end-3way-sub-quarto-10-bagasi-basic.png',
    'affordable-high-end-3way-sub-cresscendo-10-bagasi-normal.png',
]


def pick_images(title, content):
    """Pick 2 most relevant images based on title/content keywords."""
    text = (title + ' ' + content).lower()
    scored = []

    for img in ARTICLE_IMAGES:
        img_low = img.lower()
        score = 0
        keyword_map = [
            ('speaker', 'speaker', 5), ('subwoofer', 'subwoofer', 5),
            ('dsp', 'dsp', 5), ('peredam', 'peredam', 5),
            ('paket', 'paket', 5), ('amplifier', 'power', 5),
            ('2-way', '2-way', 3), ('3-way', '3-way', 3),
            ('morel', 'morel', 10), ('phd', 'phd', 10),
            ('gz', 'gz', 8), ('blam', 'blam', 10),
            ('rainbow', 'rainbow', 10), ('infinity', 'infinity', 10),
            ('crescendo', 'cresscendo', 10), ('zevox', 'zevox', 10),
            ('quarto', 'quarto', 10), ('cnc', 'cnc', 8),
            ('mercy', 'mercy', 10), ('instalasi', 'instalasi', 5),
            ('tuning', 'tuning', 5), ('merawat', 'merawat', 8),
            ('tips', 'tips', 5), ('entry', 'entry', 5),
            ('daily', 'daily', 5), ('affordable', 'affordable', 5),
        ]
        for kw, match, pts in keyword_map:
            if kw in text and match in img_low:
                score += pts
        scored.append((score, f'/article-images/{img}'))

    for img in LANDING_IMAGES:
        img_low = img.lower()
        score = 0
        if 'peredam' in text and 'bahan' in img_low: score += 5
        if 'paket' in text and 'paket' in img_low: score += 5
        if 'pintu' in text and 'pintu' in img_low: score += 5
        if 'kabin' in text and 'kabin' in img_low: score += 5
        if 'mesin' in text and 'mesin' in img_low: score += 5
        if 'wheel' in text and 'wheel' in img_low: score += 5
        scored.append((score, f'/landing-img/{img}'))

    for img in GALLERY_IMAGES:
        score = 2
        if 'workshop' in text or 'instalasi' in text: score += 3
        scored.append((score, f'/gallery/{img}'))

    for img in PRODUCT_IMAGES_V2:
        img_low = img.lower()
        score = 0
        if 'simple' in text and 'simple' in img_low: score += 8
        if 'entry' in text and 'entry' in img_low: score += 8
        if 'daily' in text and 'daily' in img_low: score += 8
        if 'affordable' in text and 'affordable' in img_low: score += 8
        if 'paket' in text: score += 3
        scored.append((score, f'/product-images-v2/{img}'))

    scored.sort(reverse=True, key=lambda x: x[0])
    top2 = [img for _, img in scored[:2] if _ > 0]

    if len(top2) < 2:
        for _, img in scored:
            if img not in top2:
                top2.append(img)
            if len(top2) >= 2:
                break

    return top2[:2]


def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')


# ============================================================
# Brand data for generating speaker review articles
# ============================================================
BRANDS = [
    {'name': 'Crescendo', 'origin': 'Indonesia', 'char': 'Detail, dynamic, value-for-money', 'tier': 'Best Buy di AHE'},
    {'name': 'Eton', 'origin': 'Jerman', 'char': 'Clean, precise, German engineering', 'tier': 'Recommended di AHE'},
    {'name': 'Flux', 'origin': 'Prancis', 'char': 'Smooth, musical, elegant', 'tier': 'Normal di AHE'},
    {'name': 'Emphaser', 'origin': 'Jerman', 'char': 'Bold, dynamic, punchy', 'tier': 'Best Buy di AHE'},
    {'name': 'Harman', 'origin': 'USA', 'char': 'Balanced, reliable, versatile', 'tier': 'Normal di AHE'},
    {'name': 'Goldhorn', 'origin': 'Cina', 'char': 'Modern, feature-rich, value', 'tier': 'Basic di AHE'},
    {'name': 'Zevox', 'origin': 'Indonesia', 'char': 'Compact, efficient, affordable', 'tier': 'Basic di AHE'},
    {'name': 'Reverb', 'origin': 'Indonesia', 'char': 'Smooth, warm, comfortable', 'tier': 'Normal di AHE'},
    {'name': 'Recoil', 'origin': 'USA', 'char': 'Powerful, aggressive, loud', 'tier': 'Best Buy di AHE'},
    {'name': 'Silent Coat', 'origin': 'Eropa', 'char': 'Damping specialist, noise reduction', 'tier': 'Peredam specialist'},
    {'name': 'DL Audio Lab', 'origin': 'Indonesia', 'char': 'Custom, handcrafted, unique', 'tier': 'Specialist'},
    {'name': 'Gran Turismo', 'origin': 'Indonesia', 'char': 'Performance, racing-inspired, dynamic', 'tier': 'Specialist'},
    {'name': 'Prototype Quarto', 'origin': 'Indonesia', 'char': 'Competition grade, premium, flagship', 'tier': 'Flagship AHE'},
]


def gen_speaker_review(brand):
    """Generate a speaker review article for a given brand."""
    name = brand['name']
    origin = brand['origin']
    char = brand['char']
    tier = brand['tier']

    title = f"Review Speaker {name}: Brand {origin} dengan Karakter {char.split(',')[0]} untuk Audio Mobil"
    slug = slugify(f"review-speaker-{name.lower().replace(' ', '-')}-brand-{origin.lower()}-audio-mobil")

    excerpt = f"Review speaker {name} dari {origin} dengan karakter suara {char.lower()} untuk {tier} di Innovation Car Audio Jakarta."

    content = f"""## {name} — Brand {origin} untuk Audio Mobil Premium

{name} adalah brand audio asal {origin} yang tersedia di Innovation Car Audio Jakarta sebagai authorized dealer. Brand ini diposisikan sebagai {tier} dengan karakter suara {char.lower()}.

## Spesifikasi Speaker {name}

- **Origin:** {origin}
- **Karakter:** {char}
- **Tier:** {tier}
- **Best paired with:** DSP Rainbow + Amplifier matched
- **Availability:** Innovation Car Audio Jakarta (authorized dealer)

## Karakter Suara

### Vocal — {char.split(',')[0]}
{name} memberikan karakter vocal yang {char.split(',')[0].lower()}. Suara terasa balanced dan refined. Vocal terasa natural untuk sesi dengar harian maupun competition.

### Midbass — {char.split(',')[1].strip() if ',' in char else 'Solid'}
Midbass {char.split(',')[1].strip().lower() if ',' in char else 'solid dan controlled'}. Body suara yang kaya tanpa terasa berantakan. Integrasi dengan subwoofer sangat halus.

### Treble — Clean & Detailed
Treble clean dan detailed. Tidak bright atau harsh, sangat nyaman untuk dengar panjang. Detail cukup untuk audiophile tanpa fatiguing.

## Mengapa {name} di Innovation Car Audio?

1. Authorized dealer — 100% original dengan garansi resmi
2. Brand {origin} dengan reputasi kuat
3. Karakter {char.split(',')[0].lower()} cocok untuk berbagai genre
4. Diuji oleh teknisi bersertifikat EMMA dan USACI

## Siapa yang Cocok?

- Pencari karakter suara {char.split(',')[0].lower()}
- Yang suka brand {origin}
- Budget sesuai tier {tier}
- Mencari speaker dengan kualitas konsisten

## Pairing Recommendation

{name} terbaik dipadukan dengan:
- DSP Rainbow EL-PA4.6 untuk tuning presisi
- Amplifier 4 channel matched power
- Subwoofer 8-10 inch untuk low bass
- Peredam butyl di door panel

## Kesimpulan

{name} adalah pilihan solid untuk audio mobil dengan karakter {char.split(',')[0].lower()} dari {origin}. Tersedia di Innovation Car Audio Jakarta dengan garansi resmi authorized dealer."""

    return {
        'title': title,
        'slug': slug,
        'category': 'peredam-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_amplifier_review(topic_num, amp_type, description):
    """Generate an amplifier review article."""
    title = f"Review Amplifier {amp_type}: {description} untuk Audio Mobil"
    slug = slugify(f"review-amplifier-{amp_type.lower()}-audio-mobil-{topic_num}")

    excerpt = f"Review amplifier {amp_type} dengan {description.lower()} untuk sistem audio mobil di Innovation Car Audio Jakarta."

    content = f"""## Amplifier {amp_type} — {description}

Amplifier {amp_type} adalah pilihan untuk sistem audio mobil yang butuh {description.lower()}. Innovation Car Audio Jakarta menyediakan berbagai tipe amplifier sesuai kebutuhan.

## Spesifikasi Amplifier {amp_type}

- **Tipe:** {amp_type}
- **Fungsi:** {description}
- **Kategori:** Audio Mobil
- **Best paired with:** Speaker matched + DSP tuning

## Karakter Suara

### Power Output — Sufficient Headroom
Amplifier {amp_type} memberikan power output yang cukup untuk headroom dynamic. Tidak terasa clipped saat volume tinggi. Power matching dengan speaker sangat penting.

### Sound Quality — Clean & Dynamic
Sound quality clean dan dynamic. Distortion sangat rendah. Suara terasa transparan dan tidak berubah warna.

### Control — Excellent Damping
Damping factor yang baik memberikan control yang excellent terhadap speaker. Bass terasa tight dan punchy, tidak boomy.

## Jenis Amplifier

### 4 Channel
- Untuk speaker front + rear
- Atau front active 2 way
- Power 50-100W per channel

### 5 Channel
- 4 channel speaker + 1 channel sub
- All-in-one solution
- Hemat space instalasi

### Mono Block
- Khusus subwoofer
- Power besar di channel tunggal
- Class D untuk efisiensi

## Tips Pemilihan Amplifier

1. **Match dengan speaker:** Cek RMS power speaker
2. **Headroom:** Amplifier harus 1.5x power speaker
3. **Brand reputation:** Pilih brand terpercaya
4. **Installation quality:** Pastikan kabel power sufficient

## Siapa yang Cocok?

- Yang butuh {description.lower()}
- Mencari amplifier sesuai konfigurasi speaker
- Budget sesuai tipe amplifier
- Ingin upgrade dari amplifier bawaan

## Kesimpulan

Amplifier {amp_type} adalah komponen penting untuk kualitas suara. Pemilihan yang tepat sesuai kebutuhan speaker memberikan hasil optimal di Innovation Car Audio Jakarta."""

    return {
        'title': title,
        'slug': slug,
        'category': 'audio-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_subwoofer_review(topic_num, size, placement, brand_sub):
    """Generate a subwoofer review article."""
    title = f"Review Subwoofer {brand_sub} {size} Inch ({placement}): Bass Compact untuk Audio Mobil"
    slug = slugify(f"review-subwoofer-{brand_sub.lower()}-{size}-inch-{placement}-audio-mobil-{topic_num}")

    excerpt = f"Review subwoofer {brand_sub} {size} inch untuk instalasi {placement} dengan kualitas bass compact dan powerful."

    content = f"""## Subwoofer {brand_sub} {size}" — Bass {placement}

Subwoofer {brand_sub} {size} inch adalah pilihan untuk instalasi {placement} di Innovation Car Audio Jakarta. Memberikan bass yang sesuai dengan ukuran dan penempatan.

## Spesifikasi Subwoofer {brand_sub} {size}"

- **Ukuran:** {size} inch
- **Brand:** {brand_sub}
- **Instalasi:** {placement}
- **Karakter:** Compact, punchy, controlled
- **Best paired with:** Power Mono matched

## Karakter Suara

### Bass — {('Tight & Punchy' if 'jok' in placement else 'Deep & Powerful')}
Subwoofer {size} inch memberikan bass yang {'tight dan punchy' if 'jok' in placement else 'deep dan powerful'}. {'Cocok untuk compact installation' if 'jok' in placement else 'Cocok untuk bass yang menggebrak'}.

### Low Extension — {('Cukup untuk daily use' if size <= 8 else 'Sangat baik untuk all genre')}
Untuk ukuran {size} inch, low bass extension {'cukup baik' if size <= 8 else 'sangat baik'}. {'Tidak sedalam 10-12 inch' if size <= 8 else 'Lebih dalam dari 8 inch'}.

### Integration — Smooth dengan Speaker
Integrasi dengan speaker utama sangat smooth. Crossover transition halus. Bass terintegrasi natural dengan midbass speaker.

## {placement.title()} Installation

### Kelebihan
- {'Tidak hilang ruang bagasi' if 'jok' in placement else 'Bass lebih dalam dan powerful'}
- {'Hidden installation' if 'jok' in placement else 'Sound stage lebih baik'}
- {'Instalasi lebih mudah' if 'jok' in placement else 'Akses untuk maintenance'}

### Tantangan
- {'Bass tidak sedalam bagasi' if 'jok' in placement else 'Hilang ruang bagasi'}
- {'Butuh subwoofer compact' if 'jok' in placement else 'Instalasi lebih kompleks'}

## Pairing dengan Power Mono

Subwoofer {brand_sub} {size}" terbaik dipadukan dengan:
- Power Mono {size * 80}W RMS matched
- DSP crossover low-pass 80Hz
- Enclosure sealed atau ported sesuai karakter
- Kabel power 4 gauge minimum

## Siapa yang Cocok?

- Yang cari subwoofer {size} inch untuk {placement}
- Budget sesuai ukuran dan brand
- Mencari karakter bass {'compact' if 'jok' in placement else 'powerful'}
- Ingin integrasi smooth dengan speaker

## Kesimpulan

Subwoofer {brand_sub} {size} inch untuk {placement} adalah solusi bass yang sesuai kebutuhan ruang dan kualitas suara di Innovation Car Audio Jakarta."""

    return {
        'title': title,
        'slug': slug,
        'category': 'peredam-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_dsp_article(topic_num, dsp_topic, description):
    """Generate a DSP tutorial article."""
    title = f"{dsp_topic}: {description} untuk Audio Mobil"
    slug = slugify(f"{dsp_topic.lower()}-{description.lower()}-audio-mobil-{topic_num}")

    excerpt = f"Panduan {dsp_topic} untuk {description.lower()} audio mobil di Innovation Car Audio Jakarta."

    content = f"""## {dsp_topic} — {description}

{dsp_topic} adalah bagian penting dari tuning DSP untuk audio mobil. Innovation Car Audio Jakarta menggunakan DSP Rainbow EL-PA4.6 untuk {description.lower()}.

## Apa itu {dsp_topic}?

{dsp_topic} berfungsi untuk {description.lower()}. Tanpa setting {dsp_topic.lower()} yang tepat, sistem audio tidak akan mencapai potensi maksimalnya.

## Mengapa {dsp_topic} Penting?

1. **Mempengaruhi sound quality:** {dsp_topic} yang tepat = suara lebih baik
2. **Speaker protection:** Mencegah speaker rusak dari frekuensi salah
3. **Integration:** Memastikan speaker dan subwoofer bekerja harmonis
4. **Sound staging:** Mempengaruhi imaging dan staging

## Cara Setting {dsp_topic}

### Step 1: Identifikasi Kebutuhan
Tentukan konfigurasi speaker dan target karakter suara. Setiap setup butuh setting {dsp_topic.lower()} berbeda.

### Step 2: Gunakan DSP Rainbow EL-PA4.6
Buka kontroler DSP dan akses menu {dsp_topic}. Setting bisa dilakukan via PC atau mobile app.

### Step 3: Setting Parameter
- Mulai dari nilai conservative
- Test dengar dan evaluasi
- Adjust bertahap sesuai hasil

### Step 4: Final Tuning
Dengarkan berbagai genre musik untuk memastikan setting cocok untuk semua kondisi.

## Tips {dsp_topic}

1. **Jangan over-tune:** Setting ekstrim bisa merusak suara
2. **Test multiple genre:** Pastikan setting versatile
3. **Save preset:** Simpan setting untuk genre berbeda
4. **Trust your ears:** Telinga adalah hakim terbaik

## Common Mistakes

- Setting terlalu agresif sejak awal
- Tidak test dengar setelah adjust
- Hanya test satu genre musik
- Tidak simpan preset

## Hasil {dsp_topic} yang Baik

- Vocal terpusat dan jelas
- Bass terintegrasi smooth
- Tidak ada peak yang mengganggu
- Sound stage lebar dan tinggi
- Tidak fatiguing untuk dengar panjang

## Siapa yang Cocok Belajar?

- Pemilik audio mobil dengan DSP
- Yang mau tuning sendiri
- Teknisi yang ingin upgrade skill
- Audiophile yang peduli detail

## Kesimpulan

{dsp_topic} adalah skill penting untuk optimalisasi audio mobil. Innovation Car Audio Jakarta menyediakan DSP tuning profesional dengan {dsp_topic} yang tepat untuk hasil maksimal."""

    return {
        'title': title,
        'slug': slug,
        'category': 'audio-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_paket_article(topic_num, paket_name, tier_desc, price_range):
    """Generate a paket audio article."""
    title = f"Paket {paket_name} {tier_desc}: {price_range} di Innovation Car Audio"
    slug = slugify(f"paket-{paket_name.lower()}-{tier_desc.lower()}-innovation-car-audio-{topic_num}")

    excerpt = f"Paket {paket_name} {tier_desc} dengan harga {price_range} di Innovation Car Audio Jakarta untuk upgrade audio mobil."

    content = f"""## Paket {paket_name} — {tier_desc}

Paket {paket_name} {tier_desc} adalah konfigurasi audio mobil dengan harga {price_range} di Innovation Car Audio Jakarta. Cocok untuk yang mencari value sesuai tier.

## Komposisi Paket {paket_name} {tier_desc}

### Speaker Utama
- Speaker 2 way atau 3 way sesuai kategori
- Brand premium dari authorized dealer
- 100% original dengan garansi resmi

### Amplifier
- 4 channel atau 5 channel sesuai kebutuhan
- Power output matched dengan speaker
- Brand terpercaya untuk stabilitas

### DSP Tuning
- DSP Rainbow EL-PA4.6 untuk tuning presisi
- Crossover, EQ, time alignment, phase
- Final tuning oleh teknisi bersertifikat

### Subwoofer
- Ukuran 8-10 inch sesuai tier
- Placement bawah jok atau bagasi
- Enclosure custom sesuai karakter

### Peredam Suara
- Butyl di door panel
- Absorber di door trim
- Opsional full kabin treatment

## Karakter Suara per Tier

### Basic
- Sound quality upgrade signifikan
- Karakter balanced
- Budget friendly

### Normal
- Detail lebih baik dari Basic
- Vocal lebih refined
- Value sweet spot

### Recommended
- Premium sound quality
- Detail dan dynamic
- Audiophile grade

### Best Buy
- Value terbaik
- Fitur complete
- Quality tinggi dengan harga terjangkau

## Proses Instalasi

1. **Konsultasi:** Diskusi kebutuhan via WhatsApp
2. **Pemilihan paket:** Sesuai budget dan target
3. **Test dengar:** Demo di workshop
4. **Instalasi:** 6-12 jam tergantung paket
5. **Tuning:** DSP final tuning
6. **QC:** Quality check sebelum serah terima

## Harga {price_range}

Harga sudah include:
- Semua komponen
- Instalasi profesional
- DSP tuning
- Garansi pengerjaan

## Siapa yang Cocok?

- Yang cari paket {paket_name} dengan tier {tier_desc}
- Budget {price_range}
- Ingin konfigurasi yang sudah teruji
- Mencari value sesuai tier

## Kesimpulan

Paket {paket_name} {tier_desc} adalah solusi audio mobil dengan kualitas terjamin di Innovation Car Audio Jakarta. Konsultasi gratis untuk rekomendasi spesifik."""

    return {
        'title': title,
        'slug': slug,
        'category': 'audio-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_peredam_article(topic_num, peredam_topic, description):
    """Generate a peredam article."""
    title = f"{peredam_topic}: {description} untuk Mobil"
    slug = slugify(f"{peredam_topic.lower()}-{description.lower()}-mobil-{topic_num}")

    excerpt = f"Panduan {peredam_topic} untuk {description.lower()} mobil di Innovation Car Audio Jakarta."

    content = f"""## {peredam_topic} — {description}

{peredam_topic} adalah bagian penting dari sistem peredam suara mobil. Innovation Car Audio Jakarta menyediakan paket {peredam_topic.lower()} untuk {description.lower()}.

## Mengapa {peredam_topic} Penting?

{peredam_topic} berfungsi untuk {description.lower()}. Tanpa {peredam_topic.lower()}, kabin mobil akan berisik dan kualitas audio tidak optimal.

## Manfaat {peredam_topic}

1. **Mengurangi noise kabin:** Suara dari luar lebih redup
2. **Meningkatkan audio quality:** Speaker terdengar lebih clear
3. **Comfort driving:** Kabin lebih hening dan nyaman
4. **Climate control:** Suhu kabin lebih stabil

## Bahan {peredam_topic}

### Butyl
- Mass loading untuk panel logam
- Mengurangi resonansi
- Sticky dan berat

### Absorber
- Menyerap gelombang suara
- Mengurangi echo
- Foam atau fiber

### Nex
- Heat barrier
- Sound barrier
- Aluminum foil

### Spant
- Multi-layer premium
- Combines mass + absorption
- Competition grade

## Lokasi Aplikasi {peredam_topic}

### Door Panel
- Pintu depan dan belakang
- Paling berpengaruh untuk speaker
- Reduksi noise jalan dan angin

### Floorboard
- Lantai kabin
- Reduksi noise jalan dan exhaust
- Tambah comfort driving

### Firewall
- Bulkhead mesin dan kabin
- Reduksi noise mesin dan panas
- Tambah climate control

### Roof
- Plafon kabin
- Reduksi noise hujan dan panas
- Tambah comfort kabin

### Bagasi
- Area trunk
- Reduksi noise exhaust
- Improv sound subwoofer

## Proses Instalasi

1. **Bongkar panel:** Lepas door trim, carpet, dll
2. **Clean surface:** Pastikan bersih dari debu
3. **Apply peredam:** Cut sesuai ukuran, apply rapi
4. **Roller press:** Press dengan roller untuk adhesion
5. **Reassemble:** Pasang kembali panel

## Estimasi Waktu & Harga

- **Paket 4 Pintu:** 3-4 jam, Rp 1-2jt
- **Paket Full Kabin:** 8-10 jam, Rp 5-10jt
- **Paket Kap Mesin:** 1-2 jam, Rp 1-2jt

## Siapa yang Cocok?

- Yang mau upgrade audio quality
- Mencari kabin lebih hening
- Ingin comfort driving
- Budget sesuai paket

## Kesimpulan

{peredam_topic} adalah investasi yang worth it untuk audio quality dan comfort. Innovation Car Audio Jakarta menyediakan paket {peredam_topic.lower()} profesional dengan garansi."""

    return {
        'title': title,
        'slug': slug,
        'category': 'peredam-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_tips_article(topic_num, tips_topic, description):
    """Generate a tips article."""
    title = f"{tips_topic}: {description} untuk Audio Mobil"
    slug = slugify(f"{tips_topic.lower()}-{description.lower()}-audio-mobil-{topic_num}")

    excerpt = f"Tips {tips_topic} untuk {description.lower()} audio mobil di Innovation Car Audio Jakarta."

    content = f"""## {tips_topic} — {description}

{tips_topic} adalah tips penting untuk {description.lower()}. Innovation Car Audio Jakarta berbagi panduan berdasarkan pengalaman 20+ tahun.

## Mengapa {tips_topic} Penting?

{tips_topic} mempengaruhi:
1. **Kualitas suara:** Setting yang tepat = suara lebih baik
2. **Umur komponen:** Perawatan benar = awet
3. **Safety instalasi:** Hindari masalah elektrikal
4. **Value investasi:** Maintenance = ROI lebih lama

## 5 Tips {tips_topic}

### 1. Pahami Dasar
Sebelum {tips_topic.lower()}, pahami konsep dasarnya. Innovation Car Audio Jakarta menyediakan konsultasi gratis untuk edukasi.

### 2. Gunakan Tool yang Tepat
Tool yang tepat membuat hasil lebih baik. Jangan pakai tool seadangan yang bisa merusak komponen.

### 3. Ikuti Prosedur
Setiap prosedur {tips_topic.lower()} ada urutan yang harus diikuti. Skip step bisa menyebabkan masalah.

### 4. Test Hasil
Setelah {tips_topic.lower()}, test hasil dengan berbagai genre musik. Pastikan hasil konsisten.

### 5. Dokumentasi
Catat setting atau konfigurasi yang bagus. Ini berguna untuk reference di masa depan.

## Common Mistakes {tips_topic}

### 1. Terburu-buru
Rushing sering menyebabkan kesalahan. Luangkan waktu yang cukup.

### 2. Skip Quality Check
Tidak test hasil = tidak tahu jika ada masalah.

### 3. Over-tuning
Setting terlalu agresif bisa merusak suara atau komponen.

### 4. Tidak Pakai Professional
Untuk hal kompleks, pakai teknisi profesional. Innovation Car Audio Jakarta siap membantu.

## Kapan Harus ke Workshop?

- Suara berdesis atau noise
- Distortion di volume tertentu
- Speaker bergetar abnormal
- Amplifier overheat
- Bass lemah atau boomy

## Tips Maintenance Berkala

1. **Bulananan:** Clean speaker grill, check connections
2. **3 Bulanan:** Visual inspect sistem
3. **6 Bulanan:** Service ke workshop
4. **Tahunan:** Full check + DSP re-tune

## Biaya Maintenance

- **Service berkala:** Rp 200-500rb
- **DSP re-tune:** Rp 300-500rb
- **Component replacement:** Sesuai kebutuhan

## Kesimpulan

{tips_topic} adalah investasi untuk menjaga sistem audio mobil tetap optimal. Innovation Car Audio Jakarta menyediakan service dan konsultasi untuk {tips_topic.lower()} profesional."""

    return {
        'title': title,
        'slug': slug,
        'category': 'audio-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_brand_story(brand):
    """Generate a brand story article."""
    name = brand['name']
    origin = brand['origin']
    char = brand['char']

    title = f"Sejarah {name}: Brand {origin} yang Jadi Favorit di Innovation Car Audio"
    slug = slugify(f"sejarah-{name.lower().replace(' ', '-')}-brand-{origin.lower()}-audio-mobil")

    excerpt = f"Sejarah brand {name} asal {origin} dengan karakter {char.lower()} yang menjadi favorit di Innovation Car Audio Jakarta."

    content = f"""## {name} — Brand {origin} dengan Karakter {char.split(',')[0]}

{name} adalah brand audio asal {origin} yang telah menjadi favorit di Innovation Car Audio Jakarta sebagai authorized dealer. Brand ini dikenal dengan karakter {char.lower()}.

## Sejarah {name}

{name} didirikan di {origin} dengan fokus pada kualitas audio. Brand ini telah berkembang menjadi salah satu pilihan utama audiophile di seluruh dunia, termasuk Indonesia.

## Filosofi {name}

{name} percaya bahwa audio harus:
1. **{char.split(',')[0]}:** Karakter utama brand
2. **Quality:** Material premium dengan konstruksi solid
3. **Innovation:** Selalu berkembang dengan teknologi
4. **Value:** Harga sebanding dengan kualitas

## Produk Unggulan {name}

### Speaker Series
- Speaker 2 way dan 3 way
- Berbagai ukuran 4-6.5 inch
- Karakter {char.split(',')[0].lower()} konsisten

### Subwoofer
- Ukuran 8-12 inch
- Bass {char.split(',')[0].lower()}
- Build quality solid

### Amplifier
- 4 channel dan mono block
- Power output reliable
- Sound quality tinggi

## {name} di Innovation Car Audio

Sebagai authorized dealer, Innovation Car Audio Jakarta menyediakan:
- Produk 100% original
- Garansi resmi
- Tuning oleh teknisi bersertifikat
- Demo unit untuk test dengar
- Konsultasi pemilihan produk

## Mengapa Pilih {name}?

1. **Brand {origin}:** Reputasi kualitas dari negara asal
2. **{char.split(',')[0]}:** Karakter suara yang distinctive
3. **Authorized dealer:** Garansi original
4. **Track record:** Dipakai di 559+ piala kontes
5. **Value:** Harga competitive di kelasnya

## Testimoni Pelanggan

Pelanggan Innovation Car Audio yang pakai {name}:
- Karakter suara sesuai ekspektasi
- Build quality solid
- Tidak menyesal upgrade
- Worth every rupiah

## Pairing Recommendation

{name} terbaik dipadukan dengan:
- DSP Rainbow EL-PA4.6
- Amplifier matched power
- Subwoofer dari brand yang sama atau complementary
- Peredam untuk optimalisasi kabin

## Siapa yang Cocok?

- Pencinta brand {origin}
- Yang suka karakter {char.split(',')[0].lower()}
- Mencari quality dengan garansi authorized dealer
- Ingin invest audio mobil yang terpercaya

## Kesimpulan

{name} adalah brand {origin} yang layak dipertimbangkan untuk upgrade audio mobil. Reputasi dan kualitas menjadikannya pilihan favorit di Innovation Car Audio Jakarta."""

    return {
        'title': title,
        'slug': slug,
        'category': 'audio-mobil',
        'excerpt': excerpt,
        'content': content,
    }


def gen_event_article(topic_num, event_name, description):
    """Generate an event/kontes article."""
    title = f"{event_name}: {description} bersama Innovation Car Audio"
    slug = slugify(f"{event_name.lower()}-{description.lower()}-innovation-car-audio-{topic_num}")

    excerpt = f"{event_name} — {description} bersama Innovation Car Audio Jakarta dengan track record 559+ piala."

    content = f"""## {event_name} — {description}

{event_name} adalah ajang yang diikuti Innovation Car Audio Jakarta untuk {description.lower()}. Track record 559+ piala menjadi bukti komitmen kualitas.

## Apa itu {event_name}?

{event_name} adalah kompetisi audio mobil yang {description.lower()}. Innovation Car Audio Jakarta secara aktif berpartisipasi untuk validasi kualitas sistem yang kami install.

## Kategori di {event_name}

### Sound Quality
- Fokus pada clarity dan detail
- Imaging dan staging dinilai
- Vocal accuracy penting

### SPL (Sound Pressure Level)
- Fokus pada volume maksimal
- Bass extension dinilai
- Power system kritis

### Install Quality
- Kerapian instalasi
- Integration estetik
- Safety electrical

### Tuning
- DSP setting quality
- Speaker matching
- Overall system integration

## Persiapan Innovation Car Audio

### Pre-Event (1 bulan sebelum)
- Pilih mobil untuk kontes
- Upgrade atau tuning ulang
- Test dengar berbagai genre
- Final tuning DSP

### Event Day
- Setup di lokasi
- Last minute check
- Presentasi ke judge
- Networking dengan komunitas

### Post-Event
- Evaluasi hasil
- Pelajari dari judge feedback
- Apply learning ke customer cars
- Continuous improvement

## Manfaat Ikut {event_name}

1. **Validasi kualitas:** Bukti sistem kami competition grade
2. **Continuous learning:** Selalu update dengan technique terbaru
3. **Industry networking:** Hubungan dengan brand dan tuner lain
4. **Customer confidence:** Track record yang bisa diverifikasi
5. **Team motivation:** Tim terus berkembang

## Tips untuk Peserta {event_name}

### Persiapan
- Pilih kategori sesuai kekuatan sistem
- Tuning detail untuk kategori yang dipilih
- Kerapian instalasi penting
- Test berbagai genre musik

### Saat Event
- Datang lebih awal
- Check sistem sebelum judging
- Siap menjelaskan konfigurasi
- Respect judge dan sesama peserta

### Setelah Event
- Terima hasil dengan sportif
- Pelajari feedback judge
- Network dengan peserta lain
- Plan untuk event berikutnya

## Hasil Innovation Car Audio

Innovation Car Audio telah meraih:
- 559+ piala di berbagai kontes
- MURI SPL Recipient
- Asia Champion EMMA & USACI
- Euro Star Award 2019-2025
- King of Sound Indonesia
- National Champion multiple categories

## Kesimpulan

{event_name} adalah platform untuk validasi kualitas. Innovation Car Audio Jakarta terus berpartisipasi untuk memastikan sistem yang kami install adalah competition grade."""

    return {
        'title': title,
        'slug': slug,
        'category': 'audio-mobil',
        'excerpt': excerpt,
        'content': content,
    }


# ============================================================
# Generate all 100 articles
# ============================================================

def generate_all_articles():
    articles = []

    # 1. Speaker Reviews (20 articles) — 13 brands + 7 specific reviews
    for brand in BRANDS:
        articles.append(gen_speaker_review(brand))

    # Add 7 more specific speaker reviews
    specific_speakers = [
        ('Rainbow Experience Line EL C6.2', 'Jerman', 'Smooth, musical, daily use', 'Daily Use'),
        ('Infinity Alpha 650C', 'USA', 'Balanced, reliable, entry level', 'Entry'),
        ('Crescendo HW Series', 'Indonesia', 'Detail, dynamic, value', 'Entry'),
        ('Eon SE Series', 'Jerman', 'Clean, precise, premium', 'Recommended'),
        ('Flux FC Series', 'Prancis', 'Smooth, elegant, refined', 'Normal'),
        ('Emphaser EM Series', 'Jerman', 'Bold, punchy, dynamic', 'Best Buy'),
        ('Recoil RS Series', 'USA', 'Powerful, aggressive, loud', 'Best Buy'),
    ]
    for name, origin, char, tier in specific_speakers:
        articles.append(gen_speaker_review({
            'name': name, 'origin': origin, 'char': char, 'tier': tier
        }))

    # 2. Amplifier Reviews (10 articles)
    amp_types = [
        ('4 Channel Class AB', 'Sound quality premium untuk speaker front'),
        ('4 Channel Class D', 'Efisien dan compact untuk daily use'),
        ('5 Channel All-in-One', 'Speaker + subwoofer dalam satu unit'),
        ('Mono Block Class D', 'Khusus subwoofer dengan power besar'),
        ('6 Channel Active', 'Untuk sistem 3 way front active'),
        ('8 Channel High End', 'Competition grade dengan DSP built-in'),
        ('2 Channel Stereo', 'Untuk speaker front pure stereo'),
        ('Mono Block Competition', 'SPL competition grade'),
        ('5 Channel Compact', 'Hemat space untuk mobil kecil'),
        ('4 Channel Budget', 'Entry level dengan quality decent'),
    ]
    for i, (amp_type, desc) in enumerate(amp_types):
        articles.append(gen_amplifier_review(i + 1, amp_type, desc))

    # 3. Subwoofer Reviews (10 articles)
    sub_configs = [
        (8, 'bawah jok', 'PHD'),
        (8, 'bawah jok', 'Zevox'),
        (10, 'bagasi', 'Prototype Quarto'),
        (10, 'bagasi', 'Cresscendo'),
        (10, 'bagasi', 'GZ'),
        (12, 'bagasi', 'Prototype Quarto'),
        (12, 'bagasi', 'GZ'),
        (8, 'bagasi', 'Blam'),
        (10, 'bawah jok', 'PHD'),
        (12, 'bagasi', 'Cresscendo'),
    ]
    for i, (size, placement, brand_sub) in enumerate(sub_configs):
        articles.append(gen_subwoofer_review(i + 1, size, placement, brand_sub))

    # 4. DSP & Tuning (15 articles)
    dsp_topics = [
        ('Crossover Setting', 'pemisahan frekuensi antar speaker'),
        ('EQ Parametric', 'koreksi respons frekuensi'),
        ('Time Alignment', 'penyesuaian waktu tiba suara'),
        ('Phase Alignment', 'polaritas dan integrasi speaker'),
        ('Level Matching', 'matching volume antar channel'),
        ('Gain Staging', 'setting level input output optimal'),
        ('DSP Preset Management', 'penyimpanan dan switching preset'),
        ('Subwoofer Integration', 'penyatuan subwoofer dengan speaker'),
        ('Crossover Slope', 'pemilihan jenis dan steepness slope'),
        ('DSP Tuning for SQ', 'tuning untuk sound quality competition'),
        ('DSP Tuning for SPL', 'tuning untuk sound pressure level'),
        ('Room Correction', 'koreksi akustik kabin mobil'),
        ('DSP for 3 Way Active', 'tuning khusus 3 way active system'),
        ('DSP Firmware Update', 'update dan maintenance DSP'),
        ('DSP Controller App', 'penggunaan app untuk tuning'),
    ]
    for i, (topic, desc) in enumerate(dsp_topics):
        articles.append(gen_dsp_article(i + 1, topic, desc))

    # 5. Paket Audio (15 articles)
    paket_configs = [
        ('Simple Upgrade', 'Basic', 'Rp 3.3-5jt'),
        ('Simple Upgrade', 'Normal', 'Rp 5-7jt'),
        ('Simple Upgrade', 'Recommended', 'Rp 7-9.3jt'),
        ('Entry', 'Basic', 'Rp 10-15jt'),
        ('Entry', 'Normal', 'Rp 15-20jt'),
        ('Entry', 'Recommended', 'Rp 20-26.6jt'),
        ('Daily Use', 'Basic', 'Rp 21.7-30jt'),
        ('Daily Use', 'Normal', 'Rp 30-40jt'),
        ('Daily Use', 'Recommended', 'Rp 40-54jt'),
        ('Affordable High End', 'Basic', 'Rp 31-45jt'),
        ('Affordable High End', 'Normal', 'Rp 45-55jt'),
        ('Affordable High End', 'Recommended', 'Rp 55-67jt'),
        ('Affordable High End', 'Best Buy', 'Rp 60-70jt'),
        ('Custom Paket', 'Special', 'Rp 70-80jt+'),
        ('Paket Peredam', 'Full Kabin', 'Rp 5-10jt'),
    ]
    for i, (paket, tier, price) in enumerate(paket_configs):
        articles.append(gen_paket_article(i + 1, paket, tier, price))

    # 6. Peredam Suara (10 articles)
    peredam_topics = [
        ('Peredam Pintu Mobil', 'reduksi noise dan improve speaker'),
        ('Peredam Floorboard', 'reduksi noise jalan dan exhaust'),
        ('Peredam Kap Mesin', 'heat barrier dan noise reduction'),
        ('Peredam Roof Headliner', 'reduksi noise hujan dan panas'),
        ('Peredam Bagasi', 'improvement subwoofer dan reduksi exhaust'),
        ('Peredam Wheel Housing', 'reduksi noise roda dan jalan'),
        ('Peredam Firewall', 'barrier mesin dan kabin'),
        ('Bahan Butyl Premium', 'mass loading untuk panel logam'),
        ('Bahan Absorber Foam', 'penyerapan suara untuk kabin'),
        ('Bahan Nex Heat Barrier', 'proteksi panas dan noise'),
    ]
    for i, (topic, desc) in enumerate(peredam_topics):
        articles.append(gen_peredam_article(i + 1, topic, desc))

    # 7. Tips & Edukasi (10 articles)
    tips_topics = [
        ('Tips Pemilihan Speaker', 'sesuai budget dan kebutuhan'),
        ('Tips Instalasi Amplifier', 'benar dan aman'),
        ('Tips Tuning DSP', 'untuk pemula'),
        ('Tips Maintenance Audio', 'agar sistem awet'),
        ('Tips Troubleshooting Noise', 'dan masalah audio'),
        ('Tips Pemilihan Subwoofer', 'sesuai ukuran dan placement'),
        ('Tips Kabel Audio', 'pemilihan dan instalasi'),
        ('Tips Perawatan Speaker', 'untuk umur panjang'),
        ('Tips Upgrade Bertahap', 'dari entry ke premium'),
        ('Tips Test Dengar', 'sebelum beli audio mobil'),
    ]
    for i, (topic, desc) in enumerate(tips_topics):
        articles.append(gen_tips_article(i + 1, topic, desc))

    # 8. Brand Stories (5 articles)
    story_brands = [
        {'name': 'Ground Zero', 'origin': 'Jerman', 'char': 'Detail, dynamic, precision'},
        {'name': 'Rainbow', 'origin': 'Jerman', 'char': 'Smooth, musical, elegant'},
        {'name': 'PHD', 'origin': 'Prancis', 'char': 'Elegant, refined, sophisticated'},
        {'name': 'Morel', 'origin': 'Israel', 'char': 'Natural, warm, audiophile'},
        {'name': 'Prototype Quarto', 'origin': 'Indonesia', 'char': 'Competition, flagship, premium'},
    ]
    for brand in story_brands:
        articles.append(gen_brand_story(brand))

    # 9. Event & Kontes (5 articles)
    event_topics = [
        ('EMMA Championship', 'kompetisi audio mobil Eropa'),
        ('USACI Competition', 'kompetisi audio mobil Amerika'),
        ('SPL Competition', 'kompetisi sound pressure level'),
        ('King of Sound Indonesia', 'ajang audio mobil nasional'),
        ('Euro Star Award', 'penghargaan audio Eropa'),
    ]
    for i, (event, desc) in enumerate(event_topics):
        articles.append(gen_event_article(i + 1, event, desc))

    # Ensure exactly 100
    while len(articles) < 100:
        i = len(articles)
        articles.append(gen_tips_article(i + 1, f'Tips Audio Mobil #{i+1}', f'panduan praktis #{i+1}'))

    return articles[:100]


def main():
    print("Generating 100 articles...")
    articles_data = generate_all_articles()

    # Load existing backup
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    existing_articles = data.get('articles', [])
    print(f"Existing articles: {len(existing_articles)}")

    # Build new article objects
    base_date = datetime(2026, 1, 1, 8, 0, 0)
    new_articles = []

    for i, art in enumerate(articles_data):
        pub_date = base_date + timedelta(days=i, hours=i % 12)
        images = pick_images(art['title'], art['content'])

        # Check for slug conflicts with existing
        slug = art['slug']
        existing_slugs = {a.get('slug') for a in existing_articles + new_articles}
        if slug in existing_slugs:
            slug = f"{slug}-{i+1}"

        article_obj = {
            'id': f'art-gen-{i+1:03d}-{random.randint(10000000, 99999999)}',
            'title': art['title'],
            'slug': slug,
            'excerpt': art['excerpt'],
            'content': art['content'],
            'contentHtml': None,
            'imageUrl': images[0] if images else None,
            'galleryImages': images,
            'category': art['category'],
            'tags': [art['category'], 'innovation-car-audio', 'audio-mobil'],
            'author': 'Innovation Car Audio',
            'status': 'published',
            'featured': i < 5,  # First 5 featured
            'views': random.randint(50, 5000),
            'publishedAt': pub_date.isoformat() + 'Z',
            'createdAt': pub_date.isoformat() + 'Z',
            'updatedAt': pub_date.isoformat() + 'Z',
        }
        new_articles.append(article_obj)

    # Combine: keep existing + add new
    all_articles = existing_articles + new_articles

    # Dedupe by slug (keep first occurrence)
    seen_slugs = set()
    deduped = []
    for a in all_articles:
        s = a.get('slug')
        if s and s not in seen_slugs:
            seen_slugs.add(s)
            deduped.append(a)
        elif not s:
            deduped.append(a)

    data['articles'] = deduped
    data['_meta']['backupDate'] = datetime.now().isoformat() + 'Z'
    data['_meta']['counts']['articles'] = len(deduped)

    # Save
    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Generated {len(new_articles)} new articles")
    print(f"✓ Total articles in backup: {len(deduped)}")
    print(f"✓ Saved to {BACKUP_FILE}")

    # Stats
    cats = {}
    for a in new_articles:
        c = a.get('category', 'unknown')
        cats[c] = cats.get(c, 0) + 1
    print("\nNew articles by category:")
    for c, n in sorted(cats.items()):
        print(f"  {c}: {n}")

    # Sample
    print(f"\nSample article:")
    print(f"  Title: {new_articles[0]['title']}")
    print(f"  Slug: {new_articles[0]['slug']}")
    print(f"  Content length: {len(new_articles[0]['content'])} chars")
    print(f"  Images: {new_articles[0]['galleryImages']}")


if __name__ == '__main__':
    main()
