#!/usr/bin/env python3
"""
Seed 84 ProductVariant dengan artikel real (bukan lorem ipsum).

Template per tier (dari 4 file upload user):
- Basic: DSP 6CH = OK, 10 KEUNGGULAN items, no disclaimer
- Normal: DSP 6CH = OK, 10 KEUNGGULAN items, no disclaimer  
- Best Buy: DSP 6CH = TIDAK BISA, 14 KEUNGGULAN items, has disclaimer
- Recommended: DSP 6CH = TIDAK BISA, 15 KEUNGGULAN items, has Jaring CNC, has disclaimer

Adaptasi per kategori:
- Simple Upgrade: speaker = "Speaker Original"
- Entry: Infinity/Rainbow/Blam/GZ Mercy
- Daily Use: PHD/Rainbow/Blam/GZ Mercy  
- Affordable High End: PHD/Morel/GZ RadioActive/GZ Mercy

Adaptasi per sub-kategori:
- Bawah Jok → Sub 8" bawah jok
- Quarto 10" → Sub 10" Quarto bagasi
- PHD 8" → Sub 8" PHD
- Cresscendo 10" → Sub 10" Cresscendo
- 2 Way / 3 Way sesuai sub-category
"""

import json
import uuid
from datetime import datetime, timezone

BACKUP_PATH = 'data/backup-sqlite.json'
IMAGE_DIR_PREFIX = '/product-images'

# ============================================================
# Category configs
# ============================================================
CATEGORIES = [
    {
        'name': 'Simple Upgrade',
        'price_min': 3_300_000,
        'price_max': 9_300_000,
        'sub_categories': [],
        'speakers': {
            'basic': 'Speaker Front — Original',
            'normal': 'Speaker Front — Original',
            'best_buy': 'Speaker Front — Original',
            'recommended': 'Speaker Front — Original',
        },
        'image_base': 'simple-upgrade',
    },
    {
        'name': 'Entry',
        'price_min': 10_000_000,
        'price_max': 26_600_000,
        'sub_categories': [
            ('2 Way Subwoofer Bawah Jok', '2way-sub-bawah-jok', '2 Way', 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)'),
            ('2 Way Subwoofer Quarto 10" (bagasi)', '2way-sub-quarto-10-bagasi', '2 Way', 'Subwoofer 10" Prototype Quarto (bagasi)'),
            ('3 Way Subwoofer Bawah Jok', '3way-sub-bawah-jok', '3 Way', 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)'),
            ('3 Way Subwoofer Quarto 10" (bagasi)', '3way-sub-quarto-10-bagasi', '3 Way', 'Subwoofer 10" Prototype Quarto (bagasi)'),
        ],
        'speakers': {
            'basic': 'Infinity Alpha 650C / 603C',
            'normal': 'Rainbow Experience Line EL-C6.2',
            'best_buy': 'Blam Relax 165 RX',
            'recommended': 'GZ Mercy GZCS 100.2 MB',
        },
        'image_base': 'upgrade-audio-series',
    },
    {
        'name': 'Daily Use',
        'price_min': 21_700_000,
        'price_max': 54_000_000,
        'sub_categories': [
            ('2 Way Subwoofer Bawah Jok', '2way-sub-bawah-jok', '2 Way', 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)'),
            ('2 Way Subwoofer Quarto 10" (bagasi)', '2way-sub-quarto-10-bagasi', '2 Way', 'Subwoofer 10" Prototype Quarto (bagasi)'),
            ('2 Way Subwoofer PHD 8" (bagasi)', '2way-sub-phd-8-bagasi', '2 Way', 'Subwoofer 8" PHD (bagasi)'),
            ('2 Way Subwoofer Cresscendo 10" (bagasi)', '2way-sub-cresscendo-10-bagasi', '2 Way', 'Subwoofer 10" Cresscendo (bagasi)'),
            ('3 Way Subwoofer Bawah Jok', '3way-sub-bawah-jok', '3 Way', 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)'),
            ('3 Way Subwoofer Quarto 10" (bagasi)', '3way-sub-quarto-10-bagasi', '3 Way', 'Subwoofer 10" Prototype Quarto (bagasi)'),
            ('3 Way Subwoofer PHD 8" (bagasi)', '3way-sub-phd-8-bagasi', '3 Way', 'Subwoofer 8" PHD (bagasi)'),
            ('3 Way Subwoofer Cresscendo 10" (bagasi)', '3way-sub-cresscendo-10-bagasi', '3 Way', 'Subwoofer 10" Cresscendo (bagasi)'),
        ],
        'speakers': {
            'basic': 'PHD MF 6.1 KIT 2 Way 6.5"',
            'normal': 'Rainbow Experience Line EL-C6.2',
            'best_buy': 'Blam Relax 165 RX',
            'recommended': 'GZ Mercy GZCS 100.2 MB 2 Way 4"',
        },
        'image_base': 'full-upgrade-audio',
    },
    {
        'name': 'Affordable High End',
        'price_min': 31_000_000,
        'price_max': 80_000_000,
        'sub_categories': [
            ('2 Way Subwoofer Bawah Jok', '2way-sub-bawah-jok', '2 Way', 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)'),
            ('2 Way Subwoofer Quarto 10" (bagasi)', '2way-sub-quarto-10-bagasi', '2 Way', 'Subwoofer 10" Prototype Quarto (bagasi)'),
            ('2 Way Subwoofer PHD 8" (bagasi)', '2way-sub-phd-8-bagasi', '2 Way', 'Subwoofer 8" PHD (bagasi)'),
            ('2 Way Subwoofer Cresscendo 10" (bagasi)', '2way-sub-cresscendo-10-bagasi', '2 Way', 'Subwoofer 10" Cresscendo (bagasi)'),
            ('3 Way Subwoofer Bawah Jok', '3way-sub-bawah-jok', '3 Way', 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)'),
            ('3 Way Subwoofer Quarto 10" (bagasi)', '3way-sub-quarto-10-bagasi', '3 Way', 'Subwoofer 10" Prototype Quarto (bagasi)'),
            ('3 Way Subwoofer PHD 8" (bagasi)', '3way-sub-phd-8-bagasi', '3 Way', 'Subwoofer 8" PHD (bagasi)'),
            ('3 Way Subwoofer Cresscendo 10" (bagasi)', '3way-sub-cresscendo-10-bagasi', '3 Way', 'Subwoofer 10" Cresscendo (bagasi)'),
        ],
        'speakers': {
            'basic': 'PHD MF 6.1 KIT 2 Way 6.5"',
            'normal': 'Morel Maximo 6',
            'best_buy': 'GZ RadioActive GZRT 25 SQ + GZRK 165 SQ',
            'recommended': 'GZ Mercy GZCS 100.2 MB 2 Way 4"',
        },
        'image_base': '2-way-subwoofer-bawah-jok',
    },
]

VARIANTS = [
    {'name': 'Basic', 'tier': 'basic', 'sortOrder': 1, 'ribbonLabel': 'BASIC', 'ribbonColor': 'slate'},
    {'name': 'Normal', 'tier': 'normal', 'sortOrder': 2, 'ribbonLabel': 'POPULAR', 'ribbonColor': 'blue'},
    {'name': 'Best Buy', 'tier': 'best_buy', 'sortOrder': 3, 'ribbonLabel': 'BEST BUY', 'ribbonColor': 'amber'},
    {'name': 'Recommended', 'tier': 'recommended', 'sortOrder': 4, 'ribbonLabel': 'RECOMMENDED', 'ribbonColor': 'emerald'},
]

TIER_IMG_MAP = {'basic': 1, 'normal': 2, 'best_buy': 3, 'recommended': 4}

def get_gallery_images(base_slug, tier):
    tier_num = TIER_IMG_MAP.get(tier, 1)
    return [
        f'{IMAGE_DIR_PREFIX}/{base_slug}-{tier_num}.png',
        f'{IMAGE_DIR_PREFIX}/{base_slug}-1.png',
        f'{IMAGE_DIR_PREFIX}/{base_slug}-2.png',
        f'{IMAGE_DIR_PREFIX}/{base_slug}-3.png',
    ]

def calc_price(price_min, price_max, total_variants, current_idx):
    if total_variants <= 1:
        return price_min
    price = price_min + (price_max - price_min) * current_idx / (total_variants - 1)
    return round(price / 100_000) * 100_000

def format_price(val):
    return f'Rp {val:,.0f}'.replace(',', '.')

# ============================================================
# Generate REAL article sections (based on 4 uploaded articles)
# ============================================================
def generate_sections(cat_name, variant, speaker, subwoofer, way):
    """Generate sections with real article content adapted from user's 4 articles."""
    tier = variant['tier']
    is_high_tier = tier in ['best_buy', 'recommended']
    has_jaring_cnc = tier == 'recommended' and 'GZ Mercy' in speaker

    # Section 1: A. PRODUK UTAMA (subsections)
    subsections = [
        {
            'title': f'1. {speaker}',
            'subtitle': f'{way} Pasif',
            'markdown': f'{speaker} menjadi speaker utama pada paket {cat_name} - {variant["name"]}. Konfigurasi {way} dirancang untuk menghasilkan reproduksi vocal yang lebih jelas, detail musik yang lebih terbuka, serta midbass yang lebih solid. Dengan pengolahan DSP, karakter speaker dapat disesuaikan dengan kondisi akustik kendaraan sehingga menghasilkan keseimbangan antara frekuensi tinggi, vocal, dan midbass.'
        },
    ]

    # Recommended variant with GZ Mercy has Jaring CNC subsection
    if has_jaring_cnc:
        subsections.append({
            'title': 'Jaring CNC Midrange (sudah termasuk dari speaker)',
            'markdown': 'Jaring CNC Midrange sudah termasuk dalam paket speaker GZ Mercy GZCS 100.2 MB, sehingga tidak dihitung sebagai item tambahan. Jaring CNC memberikan tampilan yang lebih rapi dan menyatu dengan area instalasi speaker, sekaligus memberikan kesan finishing yang lebih premium.'
        })

    subsections.extend([
        {
            'title': '2. Rainbow DSP EL-PA4.6',
            'markdown': 'DSP berfungsi sebagai pusat pengolahan dan tuning sistem audio. DSP memungkinkan sistem dilakukan pengaturan: Crossover, EQ, Level & Gain, Phase, Time Alignment, Balance, Staging, Imaging, Integrasi speaker dengan subwoofer. Dengan DSP, karakter speaker dapat disesuaikan dengan subwoofer sehingga transisi antara midrange, midbass dan low bass dapat dibuat lebih menyatu.'
        },
        {
            'title': '3. Kontroler DSP Rainbow EL-PA4.6',
            'markdown': 'Kontroler DSP digunakan untuk mempermudah pengoperasian serta pengaturan sistem sesuai kebutuhan pengguna.'
        },
        {
            'title': '4. Power Mono Prototype Quarto',
            'markdown': 'Power mono digunakan sebagai amplifier khusus untuk menggerakkan subwoofer. Amplifier khusus subwoofer membantu memberikan suplai tenaga yang sesuai untuk reproduksi frekuensi rendah sehingga bass dapat terdengar lebih kuat dan terkontrol.'
        },
        {
            'title': f'5. {subwoofer}',
            'markdown': f'{subwoofer} digunakan untuk melengkapi frekuensi rendah yang tidak dapat dihasilkan secara optimal oleh speaker utama. Targetnya: low bass lebih dalam, bass lebih berisi, impact lebih terasa, tekanan bass lebih kuat, bass tetap terkontrol, integrasi lebih baik dengan speaker utama.'
        },
    ])

    sections = [
        {'title': 'A. PRODUK UTAMA', 'type': 'subsections', 'subsections': subsections},
        # Section 2: KONFIGURASI CHANNEL DSP
        {
            'title': 'KONFIGURASI CHANNEL DSP',
            'type': 'subsections',
            'subsections': [
                {
                    'title': 'DSP 6 Channel',
                    'markdown': 'TIDAK BISA — Tidak mencukupi untuk konfigurasi yang dibutuhkan.' if is_high_tier else 'Front: ON, Rear: OFF, Sub: ON'
                },
                {
                    'title': 'DSP 8 Channel',
                    'markdown': 'Front: ON, Rear: OFF, Sub: ON — Konfigurasi ini menggunakan speaker Front dan Subwoofer sebagai sistem utama. Cocok untuk mendapatkan fokus kualitas suara dari area depan dengan dukungan low bass dari subwoofer.'
                },
                {
                    'title': 'DSP 10 Channel',
                    'markdown': 'Front: ON, Rear: ON, Sub: ON — Konfigurasi ini memungkinkan penggunaan Front, Rear dan Subwoofer secara aktif melalui DSP untuk mendapatkan sistem yang lebih lengkap di dalam kabin.'
                },
            ],
        },
        # Section 3: B. KABEL, PILAR & BOX
        {
            'title': 'B. KABEL, PILAR & BOX',
            'type': 'list',
            'items': [
                'BOX:',
                'Box kayu simple',
                'KABEL POWER:',
                'Kabel aki & ground 8 AWG (65/m x 9)',
                'Fuse Box ANL jepit 1 line',
                'Fuse Box ANL jepit 2 line',
                'Kabel remote (1 m x 5)',
                'KABEL SPEAKER & SIGNAL:',
                'Kabel speaker Front 16 AWG (15/m x 12)',
                'Kabel Sub 16 AWG (15/m x 4)',
                'Kabel input DSP 16 AWG (15/m x 10)',
                'RCA SQ 2.5 m',
                'PEREDAM:',
                'Peredam Gran Turismo (180/lbr x 3)',
            ],
        },
        # Section 4: C. JASA INSTALASI & TUNING
        {
            'title': 'C. JASA INSTALASI & TUNING',
            'type': 'list',
            'items': [
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
                'Wrapping plastik untuk jok & interior',
            ],
        },
        # Section 5: DSP SETTING & FINAL TUNING
        {
            'title': 'DSP SETTING & FINAL TUNING',
            'type': 'markdown',
            'markdown': f'Setelah seluruh perangkat selesai dipasang, dilakukan proses DSP setting dan final tuning untuk paket {cat_name} - {variant["name"]}.\n\nParameter yang disesuaikan meliputi: Crossover Front, Crossover Rear, Crossover Subwoofer, EQ, Level setiap channel, Gain, Phase, Time Alignment, Balance kiri dan kanan, Integrasi speaker dengan subwoofer, Staging, Imaging, Final listening adjustment.\n\nKarena speaker utama menggunakan konfigurasi {way}, proses tuning menjadi bagian penting untuk mendapatkan keseimbangan antara vocal/detail dengan midbass dan low bass dari subwoofer.',
        },
        # Section 6: TARGET HASIL SUARA
        {
            'title': 'TARGET HASIL SUARA',
            'type': 'markdown',
            'markdown': '**VOCAL** — Lebih jelas, fokus dan mudah dinikmati.\n\n**DETAIL** — Informasi musik lebih terdengar dengan artikulasi yang lebih jelas.\n\n**MIDBASS** — Memberikan impact dan body suara yang lebih terasa.\n\n**BASS** — Subwoofer memberikan tambahan low bass yang lebih dalam dan berisi.\n\n**STAGING & IMAGING** — DSP membantu mengatur posisi dan keseimbangan suara agar panggung musik lebih terarah.\n\n**OVERALL BALANCE** — Speaker utama dan subwoofer diselaraskan melalui DSP agar bekerja sebagai satu sistem.',
        },
        # Section 7: KEUNGGULAN PAKET
        {
            'title': f'KEUNGGULAN PAKET {variant["name"].upper()}',
            'type': 'list',
            'items': _generate_keunggulan(tier, speaker, way, subwoofer, has_jaring_cnc),
        },
    ]

    return sections

def _generate_keunggulan(tier, speaker, way, subwoofer, has_jaring_cnc):
    """Generate keunggulan list items based on tier."""
    items = [
        f'{speaker} {way}',
        'Rainbow DSP EL-PA4.6',
        'Kontroler DSP',
        'Power Mono Prototype Quarto',
        subwoofer[:50],
    ]

    if has_jaring_cnc:
        items.append('Jaring CNC Midrange sudah termasuk dari speaker')

    items.extend([
        'Konfigurasi Front + Sub atau Front + Rear + Sub',
        'Crossover & EQ melalui DSP',
        'Time Alignment & Phase Adjustment',
        'Power khusus untuk subwoofer',
        'Low bass lebih dalam dengan subwoofer',
        'Peredam Gran Turismo',
        'Phase checking',
        'Instalasi kabel dan kelistrikan yang rapi',
        'Final DSP tuning',
    ])

    return items

def _generate_intro(cat_name, variant, speaker, way, subwoofer):
    """Generate intro markdown based on tier."""
    tier = variant['tier']

    if tier == 'basic':
        return f'Paket {cat_name} - {variant["name"]} merupakan pilihan upgrade audio untuk pengguna yang ingin mendapatkan peningkatan kualitas suara secara menyeluruh dengan konfigurasi {way} + DSP + Power Mono + {subwoofer}.\n\nMenggunakan {speaker} sebagai speaker depan, dipadukan dengan DSP Rainbow EL-PA4.6, Power Mono Prototype Quarto, dan {subwoofer}. Konfigurasi ini memberikan kombinasi antara vocal dan detail yang lebih jelas dari speaker depan, pengaturan suara melalui DSP, serta tambahan tenaga dan reproduksi bass dari sistem mono amplifier dan subwoofer.'

    elif tier == 'normal':
        return f'Paket {cat_name} - {variant["name"]} dirancang sebagai upgrade audio system yang lengkap untuk penggunaan harian dengan peningkatan kualitas suara pada area depan dan belakang, sekaligus memberikan dukungan bass yang lebih dalam dan bertenaga.\n\nKombinasi {speaker}, Rainbow DSP EL-PA4.6, Power Mono Prototype Quarto, dan {subwoofer} menghasilkan sistem yang lebih lengkap, dengan karakter suara yang detail, tonal balance yang baik, vocal lebih jelas, midbass lebih berisi, serta low bass yang lebih dalam dan terkontrol.\n\nDSP berfungsi sebagai pusat pengaturan sistem untuk menyelaraskan karakter suara speaker, subwoofer, dan amplifier sehingga seluruh sistem dapat bekerja lebih terintegrasi.'

    elif tier == 'best_buy':
        return f'Paket {cat_name} - {variant["name"]} merupakan paket upgrade audio yang dirancang untuk pengguna yang menginginkan peningkatan kualitas suara secara menyeluruh dengan kombinasi {speaker}, Rainbow DSP EL-PA4.6, Power Mono Prototype Quarto, dan {subwoofer}.\n\nKombinasi ini memberikan peningkatan mulai dari vocal, detail, midbass, staging hingga low bass, sementara DSP digunakan untuk mengatur karakter dan integrasi seluruh sistem agar terdengar lebih seimbang dan menyatu.\n\nDengan konsep {way} + DSP + {subwoofer}, paket ini memberikan fondasi sistem yang lengkap untuk penggunaan harian, dengan karakter suara yang tetap nyaman tetapi memiliki detail, impact dan bass yang lebih terasa.'

    else:  # recommended
        return f'Paket {cat_name} - {variant["name"]} ini dirancang untuk pengguna yang menginginkan upgrade audio dengan karakter suara yang lebih fokus, detail dan terarah, menggunakan {speaker}, Rainbow DSP EL-PA4.6, Power Mono Prototype Quarto, serta {subwoofer}.\n\nKombinasi speaker dengan DSP memberikan karakter suara yang lebih fokus pada area vocal dan detail, sementara {subwoofer} memberikan dukungan frekuensi rendah sehingga sistem tetap memiliki bass yang lebih dalam dan berisi.\n\nKeunggulan lainnya, Jaring CNC Midrange sudah termasuk dari speaker, sehingga tampilan area midrange menjadi lebih rapi sekaligus memberikan finishing yang lebih premium.' if 'GZ Mercy' in speaker else f'Paket {cat_name} - {variant["name"]} ini dirancang untuk pengguna yang menginginkan upgrade audio dengan karakter suara yang lebih fokus, detail dan terarah, menggunakan {speaker}, Rainbow DSP EL-PA4.6, Power Mono Prototype Quarto, serta {subwoofer}.\n\nKombinasi speaker dengan DSP memberikan karakter suara yang lebih fokus pada area vocal dan detail, sementara {subwoofer} memberikan dukungan frekuensi rendah sehingga sistem tetap memiliki bass yang lebih dalam dan berisi.'

def _generate_closing(variant, cat_name, speaker, way, subwoofer):
    """Generate closing tagline + components."""
    tier = variant['tier']

    if tier == 'basic':
        tagline = f'{variant["name"].upper()} — {cat_name} {way} + DSP + Power Mono + {subwoofer[:30]}'
    elif tier == 'normal':
        tagline = f'PAKET {variant["name"].upper()} — {speaker[:30]} + DSP + {subwoofer[:30]}'
    elif tier == 'best_buy':
        tagline = f'{variant["name"].upper()} — {speaker[:30]} + DSP + Power Mono + {subwoofer[:30]}'
    else:
        tagline = f'PAKET {variant["name"].upper()} — {speaker[:30]} + DSP + Power Mono + {subwoofer[:30]}'

    components = [speaker, 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', subwoofer[:50]]

    has_disclaimer = tier in ['best_buy', 'recommended']
    disclaimer = 'Harga non-diskon mengikuti harga yang tercantum pada brosur' if has_disclaimer else None

    return tagline, components, disclaimer

def _generate_card_title(way, speaker, subwoofer):
    """Generate card title for carousel."""
    speaker_short = speaker[:25] if speaker else ''
    sub_short = subwoofer[:20] if subwoofer else ''
    return f'{way} + DSP + {sub_short}'

def _generate_card_description(cat_name, variant, speaker, way, subwoofer):
    """Generate card description for carousel."""
    tier = variant['tier']

    if tier == 'basic':
        return f'{cat_name} - {variant["name"]}: {speaker[:25]} + DSP Rainbow + Power Mono + {subwoofer[:25]}. Upgrade lengkap untuk daily use.'
    elif tier == 'normal':
        return f'{cat_name} - {variant["name"]}: {speaker[:25]} + DSP + Power Mono + {subwoofer[:25]}. Combo seimbang dengan tonal balance baik.'
    elif tier == 'best_buy':
        return f'{cat_name} - {variant["name"]}: {speaker[:25]} + DSP + Power Mono + {subwoofer[:25]}. Detail, impact, dan bass yang lebih terasa.'
    else:
        return f'{cat_name} - {variant["name"]}: {speaker[:25]} + DSP + Power Mono + {subwoofer[:25]} + Jaring CNC. Konfigurasi terlengkap.'

# ============================================================
# Main
# ============================================================
def main():
    with open(BACKUP_PATH, 'r') as f:
        data = json.load(f)

    products = []
    variants = []
    now = datetime.now(timezone.utc).isoformat()
    prod_idx = 0
    var_idx = 0

    for cat in CATEGORIES:
        cat_name = cat['name']
        cat_slug = cat_name.lower().replace(' ', '-')

        if not cat['sub_categories']:
            # Simple Upgrade: 1 product, no sub-category
            prod_idx += 1
            product_id = f'prod-{prod_idx:03d}-{uuid.uuid4().hex[:8]}'
            gallery = get_gallery_images(cat['image_base'], 'basic')

            products.append({
                'id': product_id,
                'name': cat_name,
                'slug': cat_slug,
                'category': cat_name,
                'subCategory': '',
                'shortDescription': f'{cat_name} — paket upgrade audio dengan speaker original tetap dipertahankan',
                'imageUrl': gallery[0],
                'imageAlt': cat_name,
                'waNumber': '6282211222399',
                'sortOrder': prod_idx,
                'isActive': True,
                'createdAt': now,
                'updatedAt': now,
            })

            for var_local, variant in enumerate(VARIANTS):
                var_idx += 1
                price = calc_price(cat['price_min'], cat['price_max'], 4, var_local)
                speaker = cat['speakers'][variant['tier']]
                var_gallery = get_gallery_images(cat['image_base'], variant['tier'])
                slug = f'{cat_slug}-{variant["tier"].replace("_", "-")}'
                way = '2 Way'
                subwoofer = 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)'

                sections = generate_sections(cat_name, variant, speaker, subwoofer, way)
                intro = _generate_intro(cat_name, variant, speaker, way, subwoofer)
                tagline, components, disclaimer = _generate_closing(variant, cat_name, speaker, way, subwoofer)

                variants.append({
                    'id': f'var-{var_idx:03d}-{uuid.uuid4().hex[:8]}',
                    'productId': product_id,
                    'name': variant['name'],
                    'slug': slug,
                    'tier': variant['tier'],
                    'sortOrder': variant['sortOrder'],
                    'price': format_price(price),
                    'priceValue': price,
                    'priceNote': 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
                    'ribbonLabel': variant['ribbonLabel'],
                    'ribbonColor': variant['ribbonColor'],
                    'cardTitle': _generate_card_title(way, speaker, subwoofer),
                    'cardDescription': _generate_card_description(cat_name, variant, speaker, way, subwoofer),
                    'imageUrl': var_gallery[0],
                    'imageAlt': f'{cat_name} {variant["name"]}',
                    'galleryImages': var_gallery,
                    'tagline': 'Innovation Car Audio Jakarta',
                    'introMarkdown': intro,
                    'sections': sections,
                    'closingTagline': tagline,
                    'closingComponents': components,
                    'disclaimer': disclaimer,
                    'isActive': True,
                    'createdAt': now,
                    'updatedAt': now,
                })
        else:
            total_subs = len(cat['sub_categories'])
            for sub_idx, (sub_name, sub_slug, way, subwoofer) in enumerate(cat['sub_categories']):
                prod_idx += 1
                product_id = f'prod-{prod_idx:03d}-{uuid.uuid4().hex[:8]}'
                gallery = get_gallery_images(cat['image_base'], 'basic')

                products.append({
                    'id': product_id,
                    'name': sub_name,
                    'slug': f'{cat_slug}-{sub_slug}',
                    'category': cat_name,
                    'subCategory': sub_name,
                    'shortDescription': f'{cat_name} - {way} dengan {subwoofer[:40]}',
                    'imageUrl': gallery[0],
                    'imageAlt': sub_name,
                    'waNumber': '6282211222399',
                    'sortOrder': prod_idx,
                    'isActive': True,
                    'createdAt': now,
                    'updatedAt': now,
                })

                for var_local, variant in enumerate(VARIANTS):
                    var_idx += 1
                    linear_idx = sub_idx * 4 + var_local
                    total_cat_variants = total_subs * 4
                    price = calc_price(cat['price_min'], cat['price_max'], total_cat_variants, linear_idx)
                    speaker = cat['speakers'][variant['tier']]
                    var_gallery = get_gallery_images(cat['image_base'], variant['tier'])
                    slug = f'{cat_slug}-{sub_slug}-{variant["tier"].replace("_", "-")}'

                    sections = generate_sections(cat_name, variant, speaker, subwoofer, way)
                    intro = _generate_intro(cat_name, variant, speaker, way, subwoofer)
                    tagline, components, disclaimer = _generate_closing(variant, cat_name, speaker, way, subwoofer)

                    variants.append({
                        'id': f'var-{var_idx:03d}-{uuid.uuid4().hex[:8]}',
                        'productId': product_id,
                        'name': variant['name'],
                        'slug': slug,
                        'tier': variant['tier'],
                        'sortOrder': variant['sortOrder'],
                        'price': format_price(price),
                        'priceValue': price,
                        'priceNote': 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
                        'ribbonLabel': variant['ribbonLabel'],
                        'ribbonColor': variant['ribbonColor'],
                        'cardTitle': _generate_card_title(way, speaker, subwoofer),
                        'cardDescription': _generate_card_description(cat_name, variant, speaker, way, subwoofer),
                        'imageUrl': var_gallery[0],
                        'imageAlt': f'{cat_name} {sub_name} {variant["name"]}',
                        'galleryImages': var_gallery,
                        'tagline': 'Innovation Car Audio Jakarta',
                        'introMarkdown': intro,
                        'sections': sections,
                        'closingTagline': tagline,
                        'closingComponents': components,
                        'disclaimer': disclaimer,
                        'isActive': True,
                        'createdAt': now,
                        'updatedAt': now,
                    })

    data['products'] = products
    data['productVariants'] = variants

    with open(BACKUP_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f'=== SEED COMPLETE (REAL ARTICLES) ===')
    print(f'Products: {len(products)}')
    print(f'Variants: {len(variants)}')
    print()
    for cat in CATEGORIES:
        cat_vars = [v for v in variants if any(p['category'] == cat['name'] and p['id'] == v['productId'] for p in products)]
        if cat_vars:
            prices = [v['priceValue'] for v in cat_vars]
            has_disclaimer = sum(1 for v in cat_vars if v.get('disclaimer'))
            print(f'  {cat["name"]:<25}: {len(cat_vars):2d} varian | {format_price(min(prices))} - {format_price(max(prices))} | {has_disclaimer} with disclaimer')
    print()
    print(f'=== Sample variant sections (Entry - 2 Way Sub Quarto 10 - Best Buy) ===')
    sample = next((v for v in variants if 'entry-2way-sub-quarto-10-bagasi-best-buy' in v['slug']), None)
    if sample:
        print(f'  Slug: {sample["slug"]}')
        print(f'  Speaker: {sample["closingComponents"][0]}')
        print(f'  Sections: {len(sample["sections"])}')
        for s in sample['sections']:
            items = len(s.get('items', s.get('subsections', [])))
            print(f'    - {s["title"][:50]:<50} [{s["type"]}] ({items} items)')

if __name__ == '__main__':
    main()
