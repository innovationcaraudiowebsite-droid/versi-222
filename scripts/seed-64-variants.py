#!/usr/bin/env python3
"""
Seed 64 ProductVariant (16 produk × 4 varian) dengan struktur kategori baru.

Categories (4): Simple Upgrade, Entry, Daily Use, Affordable High End
Sub-Categories (4): 2 Way Sub Bawah Jok, 2 Way Sub Quarto 10", 3 Way Sub Bawah Jok, 3 Way Sub Quarto 10"
Variants (4): Basic, Normal, Best Buy, Recommended

Total: 4 × 4 × 4 = 64 variants

Price ranges:
- Simple Upgrade: Rp 3.3jt - Rp 9.3jt
- Entry: Rp 10jt - Rp 26.6jt
- Daily Use: Rp 21.7jt - Rp 54jt
- Affordable High End: Rp 31jt - Rp 80jt

Content: Lorem ipsum dengan struktur artikel yang sama untuk semua varian.
Images: Reuse dari 92 gambar AI yang sudah ada (map by slug pattern).
"""

import json
import uuid
from datetime import datetime, timezone

BACKUP_PATH = 'data/backup-sqlite.json'
IMAGE_DIR_PREFIX = '/product-images'

# ============================================================
# Category configs (price range + speaker mapping)
# ============================================================
CATEGORIES = [
    {
        'name': 'Simple Upgrade',
        'price_min': 3_300_000,
        'price_max': 9_300_000,
        'speakers': {
            'basic': 'Speaker Original',
            'normal': 'Speaker Original',
            'best_buy': 'Speaker Original',
            'recommended': 'Speaker Original',
        },
    },
    {
        'name': 'Entry',
        'price_min': 10_000_000,
        'price_max': 26_600_000,
        'speakers': {
            'basic': 'Infinity Alpha 650C / 603C',
            'normal': 'Rainbow Experience Line EL-C6.2',
            'best_buy': 'Blam Relax 165 RX',
            'recommended': 'GZ Mercy GZCS 100.2 MB',
        },
    },
    {
        'name': 'Daily Use',
        'price_min': 21_700_000,
        'price_max': 54_000_000,
        'speakers': {
            'basic': 'PHD MF 6.1 KIT 2 Way 6.5"',
            'normal': 'Rainbow Experience Line EL-C6.2',
            'best_buy': 'Blam Relax 165 RX',
            'recommended': 'GZ Mercy GZCS 100.2 MB 2 Way 4"',
        },
    },
    {
        'name': 'Affordable High End',
        'price_min': 31_000_000,
        'price_max': 80_000_000,
        'speakers': {
            'basic': 'PHD MF 6.1 KIT 2 Way 6.5"',
            'normal': 'Morel Maximo 6',
            'best_buy': 'GZ RadioActive GZRT 25 SQ + GZRK 165 SQ',
            'recommended': 'GZ Mercy GZCS 100.2 MB 2 Way 4"',
        },
    },
]

SUB_CATEGORIES = [
    {
        'name': '2 Way Subwoofer Bawah Jok',
        'slug_part': '2way-sub-bawah-jok',
        'subwoofer': 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)',
        'way_config': '2 Way',
    },
    {
        'name': '2 Way Subwoofer Quarto 10" (bagasi)',
        'slug_part': '2way-sub-quarto-10-bagasi',
        'subwoofer': 'Subwoofer 10" Prototype Quarto (bagasi)',
        'way_config': '2 Way',
    },
    {
        'name': '3 Way Subwoofer Bawah Jok',
        'slug_part': '3way-sub-bawah-jok',
        'subwoofer': 'Subwoofer 8" bawah jok (Zevox ZV 8 SAS)',
        'way_config': '3 Way',
    },
    {
        'name': '3 Way Subwoofer Quarto 10" (bagasi)',
        'slug_part': '3way-sub-quarto-10-bagasi',
        'subwoofer': 'Subwoofer 10" Prototype Quarto (bagasi)',
        'way_config': '3 Way',
    },
]

VARIANTS = [
    {
        'name': 'Basic', 'tier': 'basic', 'sortOrder': 1,
        'ribbonLabel': 'BASIC', 'ribbonColor': 'slate',
    },
    {
        'name': 'Normal', 'tier': 'normal', 'sortOrder': 2,
        'ribbonLabel': 'POPULAR', 'ribbonColor': 'blue',
    },
    {
        'name': 'Best Buy', 'tier': 'best_buy', 'sortOrder': 3,
        'ribbonLabel': 'BEST BUY', 'ribbonColor': 'amber',
    },
    {
        'name': 'Recommended', 'tier': 'recommended', 'sortOrder': 4,
        'ribbonLabel': 'RECOMMENDED', 'ribbonColor': 'emerald',
    },
]

# ============================================================
# Generate lorem ipsum sections for variant
# ============================================================
def generate_sections(cat_name, sub_cat, variant, speaker, subwoofer):
    """Generate 9 sections dengan lorem ipsum content."""
    tier = variant['tier']
    way = sub_cat['way_config']
    sub_name = subwoofer[:40]

    return [
        {
            'title': f'A. PRODUK UTAMA',
            'type': 'subsections',
            'subsections': [
                {
                    'title': f'1. {speaker}',
                    'subtitle': f'{way} Pasif',
                    'markdown': f'Lorem ipsum dolor sit amet. {speaker} digunakan sebagai speaker utama pada paket {cat_name} - {variant["name"]}. Konfigurasi {way} memberikan karakter suara yang lebih fokus pada reproduksi vocal, midrange dan detail musik. Target: vocal lebih jelas, detail musik lebih mudah terdengar, imaging lebih terarah, karakter nyaman untuk penggunaan harian.',
                },
                {
                    'title': '2. Rainbow DSP EL-PA4.6',
                    'markdown': 'Lorem ipsum dolor sit amet. DSP berfungsi sebagai pusat pengolahan dan tuning sistem audio. Pengaturan meliputi: Crossover, EQ, Level & Gain, Phase, Time Alignment, Balance, Staging, Imaging, Integrasi speaker dengan subwoofer.',
                },
                {
                    'title': '3. Kontroler DSP Rainbow EL-PA4.6',
                    'markdown': 'Lorem ipsum dolor sit amet. Kontroler DSP digunakan untuk mempermudah pengoperasian serta pengaturan sistem sesuai kebutuhan pengguna.',
                },
                {
                    'title': '4. Power Mono Prototype Quarto',
                    'markdown': 'Lorem ipsum dolor sit amet. Power mono digunakan sebagai amplifier khusus untuk menggerakkan subwoofer. Amplifier khusus subwoofer membantu memberikan suplai tenaga yang sesuai untuk reproduksi frekuensi rendah.',
                },
                {
                    'title': f'5. {sub_name}',
                    'markdown': f'Lorem ipsum dolor sit amet. {subwoofer} digunakan untuk melengkapi frekuensi rendah yang tidak dapat dihasilkan secara optimal oleh speaker utama. Target: low bass lebih dalam, bass lebih berisi, impact lebih terasa, bass tetap terkontrol.',
                },
            ],
        },
        {
            'title': 'KONFIGURASI CHANNEL DSP',
            'type': 'subsections',
            'subsections': [
                {
                    'title': 'DSP 6 Channel',
                    'markdown': 'Front: ON, Rear: OFF, Sub: ON' if tier in ['basic', 'normal'] else 'TIDAK BISA — Tidak mencukupi untuk konfigurasi yang dibutuhkan.',
                },
                {
                    'title': 'DSP 8 Channel',
                    'markdown': 'Front: ON, Rear: OFF, Sub: ON — Sistem difokuskan pada speaker Front + Subwoofer.',
                },
                {
                    'title': 'DSP 10 Channel',
                    'markdown': 'Front: ON, Rear: ON, Sub: ON — Konfigurasi penuh dengan Front + Rear + Subwoofer aktif.',
                },
            ],
        },
        {
            'title': 'B. KABEL, PILAR & BOX',
            'type': 'list',
            'items': [
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
                'Peredam Gran Turismo (180/lbr × 3)',
            ],
        },
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
        {
            'title': 'DSP SETTING & FINAL TUNING',
            'type': 'markdown',
            'markdown': f'Lorem ipsum dolor sit amet. Setelah seluruh perangkat selesai dipasang, dilakukan proses DSP setting dan final tuning untuk paket {cat_name} - {variant["name"]}.\n\nParameter yang disesuaikan meliputi: Crossover Front, Crossover Rear, Crossover Subwoofer, EQ, Level setiap channel, Gain, Phase, Time Alignment, Balance kiri dan kanan, Integrasi speaker dengan subwoofer, Staging, Imaging, Final listening adjustment.',
        },
        {
            'title': 'TARGET HASIL SUARA',
            'type': 'markdown',
            'markdown': '**VOCAL** — Lebih jelas, fokus dan mudah dinikmati.\n\n**DETAIL** — Informasi musik lebih terdengar dengan artikulasi yang lebih jelas.\n\n**MIDBASS** — Memberikan impact dan body suara yang lebih terasa.\n\n**BASS** — Subwoofer memberikan tambahan low bass yang lebih dalam dan berisi.\n\n**STAGING & IMAGING** — DSP membantu mengatur posisi dan keseimbangan suara.\n\n**OVERALL BALANCE** — Speaker utama dan subwoofer diselaraskan melalui DSP agar bekerja sebagai satu sistem.',
        },
        {
            'title': f'KEUNGGULAN PAKET {variant["name"].upper()}',
            'type': 'list',
            'items': [
                f'{speaker} {way}',
                'Rainbow DSP EL-PA4.6',
                'Kontroler DSP',
                'Power Mono Prototype Quarto',
                'Subwoofer Prototype Quarto',
                'Konfigurasi Front + Sub atau Front + Rear + Sub',
                'Crossover & EQ melalui DSP',
                'Time Alignment & Phase Adjustment',
                'Power khusus untuk subwoofer',
                'Low bass lebih dalam dengan subwoofer',
                'Peredam Gran Turismo',
                'Phase checking',
                'Instalasi kabel dan kelistrikan yang rapi',
                'Final DSP tuning',
            ],
        },
    ]

# ============================================================
# Generate price for variant
# ============================================================
def calc_price(cat_idx, sub_idx, var_idx):
    """Distribute prices evenly across 16 variants per category."""
    cat = CATEGORIES[cat_idx]
    total_variants = 16  # 4 sub × 4 var
    linear_idx = sub_idx * 4 + var_idx  # 0..15
    price = cat['price_min'] + (cat['price_max'] - cat['price_min']) * linear_idx / (total_variants - 1)
    # Round to nearest 100k
    price = round(price / 100_000) * 100_000
    return price

def format_price(val):
    """Format: Rp 3.300.000"""
    return f'Rp {val:,.0f}'.replace(',', '.')

# ============================================================
# Image mapping: reuse existing images
# ============================================================
# Map category+sub to existing image slugs
IMAGE_MAP = {
    # Simple Upgrade → use simple-upgrade-* images
    ('Simple Upgrade', '2 Way Subwoofer Bawah Jok'): 'simple-upgrade',
    ('Simple Upgrade', '2 Way Subwoofer Quarto 10" (bagasi)'): 'simple-upgrade',
    ('Simple Upgrade', '3 Way Subwoofer Bawah Jok'): 'simple-upgrade',
    ('Simple Upgrade', '3 Way Subwoofer Quarto 10" (bagasi)'): 'simple-upgrade',
    # Entry → use 2-way-upgrade-audio-* or upgrade-audio-series-* images
    ('Entry', '2 Way Subwoofer Bawah Jok'): '2-way-upgrade-audio',
    ('Entry', '2 Way Subwoofer Quarto 10" (bagasi)'): 'upgrade-audio-series',
    ('Entry', '3 Way Subwoofer Bawah Jok'): '2-way-upgrade-audio',
    ('Entry', '3 Way Subwoofer Quarto 10" (bagasi)'): 'upgrade-audio-series',
    # Daily Use → use full-upgrade-audio-* images
    ('Daily Use', '2 Way Subwoofer Bawah Jok'): 'full-upgrade-audio',
    ('Daily Use', '2 Way Subwoofer Quarto 10" (bagasi)'): 'full-upgrade-audio',
    ('Daily Use', '3 Way Subwoofer Bawah Jok'): 'full-upgrade-audio',
    ('Daily Use', '3 Way Subwoofer Quarto 10" (bagasi)'): 'full-upgrade-audio',
    # Affordable High End → use 2-way-subwoofer-bawah-jok-* images
    ('Affordable High End', '2 Way Subwoofer Bawah Jok'): '2-way-subwoofer-bawah-jok',
    ('Affordable High End', '2 Way Subwoofer Quarto 10" (bagasi)'): 'upgrade-audio-series',
    ('Affordable High End', '3 Way Subwoofer Bawah Jok'): '2-way-subwoofer-bawah-jok',
    ('Affordable High End', '3 Way Subwoofer Quarto 10" (bagasi)'): 'upgrade-audio-series',
}

# Variant tier → image suffix (1-4)
TIER_IMG_MAP = {'basic': 1, 'normal': 2, 'best_buy': 3, 'recommended': 4}

def get_gallery_images(cat_name, sub_cat_name, tier):
    """Return 4 image URLs from existing generated images."""
    base_slug = IMAGE_MAP.get((cat_name, sub_cat_name), 'simple-upgrade')
    tier_num = TIER_IMG_MAP.get(tier, 1)
    return [
        f'{IMAGE_DIR_PREFIX}/{base_slug}-{tier_num}.png',
        f'{IMAGE_DIR_PREFIX}/{base_slug}-1.png',
        f'{IMAGE_DIR_PREFIX}/{base_slug}-2.png',
        f'{IMAGE_DIR_PREFIX}/{base_slug}-3.png',
    ]

# ============================================================
# Main: generate all 64 variants
# ============================================================
def main():
    with open(BACKUP_PATH, 'r') as f:
        data = json.load(f)

    products = []
    variants = []
    now = datetime.now(timezone.utc).isoformat()
    prod_idx = 0
    var_idx = 0

    for cat_idx, cat in enumerate(CATEGORIES):
        for sub_idx, sub in enumerate(SUB_CATEGORIES):
            prod_idx += 1
            product_id = f'prod-{prod_idx:03d}-{uuid.uuid4().hex[:8]}'

            # Product name = sub-category name
            product_name = sub['name']
            product_slug = sub['slug_part']

            # Get first variant's image as product image
            first_img = get_gallery_images(cat['name'], sub['name'], 'basic')[0]

            products.append({
                'id': product_id,
                'name': product_name,
                'slug': f'{cat["name"].lower().replace(" ", "-")}-{product_slug}',
                'category': cat['name'],
                'subCategory': sub['name'],
                'shortDescription': f'{cat["name"]} - {sub["way_config"]} dengan {sub["subwoofer"][:30]}',
                'imageUrl': first_img,
                'imageAlt': product_name,
                'waNumber': '6282211222399',
                'sortOrder': prod_idx,
                'isActive': True,
                'createdAt': now,
                'updatedAt': now,
            })

            for var_idx_local, variant in enumerate(VARIANTS):
                var_idx += 1
                price_val = calc_price(cat_idx, sub_idx, var_idx_local)
                speaker = cat['speakers'][variant['tier']]
                gallery = get_gallery_images(cat['name'], sub['name'], variant['tier'])

                slug = f'{cat["name"].lower().replace(" ", "-")}-{product_slug}-{variant["tier"].replace("_", "-")}'

                variants.append({
                    'id': f'var-{var_idx:03d}-{uuid.uuid4().hex[:8]}',
                    'productId': product_id,
                    'name': variant['name'],
                    'slug': slug,
                    'tier': variant['tier'],
                    'sortOrder': variant['sortOrder'],
                    'price': format_price(price_val),
                    'priceValue': price_val,
                    'priceNote': 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
                    'ribbonLabel': variant['ribbonLabel'],
                    'ribbonColor': variant['ribbonColor'],
                    'cardTitle': f'{sub["way_config"]} + DSP + {sub["subwoofer"][:20]}',
                    'cardDescription': f'{cat["name"]} - {variant["name"]}: {speaker[:30]} + DSP Rainbow + Power Mono + {sub["subwoofer"][:20]}',
                    'imageUrl': gallery[0],
                    'imageAlt': f'{cat["name"]} {variant["name"]}',
                    'galleryImages': gallery,
                    'tagline': 'Innovation Car Audio Jakarta',
                    'introMarkdown': f'Paket {cat["name"]} - {variant["name"]} dengan konfigurasi {sub["way_config"]} + DSP + Power Mono + {sub["subwoofer"]}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Speaker: {speaker}.',
                    'sections': generate_sections(cat['name'], sub, variant, speaker, sub['subwoofer']),
                    'closingTagline': f'{variant["name"].upper()} — {cat["name"]} {sub["way_config"]} + DSP + Subwoofer',
                    'closingComponents': [speaker, 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', sub['subwoofer']],
                    'disclaimer': 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
                    'isActive': True,
                    'createdAt': now,
                    'updatedAt': now,
                })

    # Replace products + variants in backup JSON
    data['products'] = products
    data['productVariants'] = variants

    with open(BACKUP_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Summary
    print(f'=== SEED COMPLETE ===')
    print(f'Products: {len(products)}')
    print(f'Variants: {len(variants)}')
    print(f'Backup file: {BACKUP_PATH}')
    print()
    print('=== Price distribution per category ===')
    for cat in CATEGORIES:
        cat_variants = [v for v in variants if any(p['category'] == cat['name'] for p in products if p['id'] == v['productId'])]
        prices = [v['priceValue'] for v in cat_variants]
        print(f'  {cat["name"]}: {format_price(min(prices))} - {format_price(max(prices))} ({len(cat_variants)} variants)')
    print()
    print('=== Sample 5 variants ===')
    for v in variants[:5]:
        p = next(p for p in products if p['id'] == v['productId'])
        print(f'  {p["category"]:<22} | {p["subCategory"][:30]:<30} | {v["name"]:<12} | {v["price"]}')

if __name__ == '__main__':
    main()
