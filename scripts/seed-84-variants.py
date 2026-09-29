#!/usr/bin/env python3
"""
Seed 84 ProductVariant dengan struktur non-uniform per kategori.

Structure:
1. Simple Upgrade:     1 product (no sub-cat) × 4 var = 4 variants
2. Entry:              4 sub-cat × 4 var = 16 variants
3. Daily Use:          8 sub-cat × 4 var = 32 variants
4. Affordable High End: 8 sub-cat × 4 var = 32 variants

Total: 21 products, 84 variants

Price ranges:
- Simple Upgrade: Rp 3.3jt - Rp 9.3jt
- Entry: Rp 10jt - Rp 26.6jt
- Daily Use: Rp 21.7jt - Rp 54jt
- Affordable High End: Rp 31jt - Rp 80jt
"""

import json
import uuid
from datetime import datetime, timezone

BACKUP_PATH = 'data/backup-sqlite.json'
IMAGE_DIR_PREFIX = '/product-images'

# ============================================================
# Category configs with sub-categories per category
# ============================================================
CATEGORIES = [
    {
        'name': 'Simple Upgrade',
        'price_min': 3_300_000,
        'price_max': 9_300_000,
        'sub_categories': [],  # No sub-categories — 1 product with 4 variants
        'speakers': {
            'basic': 'Speaker Original',
            'normal': 'Speaker Original',
            'best_buy': 'Speaker Original',
            'recommended': 'Speaker Original',
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

def generate_sections(cat_name, variant, speaker, sub_name, subwoofer, way):
    tier = variant['tier']
    return [
        {
            'title': 'A. PRODUK UTAMA',
            'type': 'subsections',
            'subsections': [
                {'title': f'1. {speaker}', 'subtitle': f'{way} Pasif', 'markdown': f'Lorem ipsum dolor sit amet. {speaker} digunakan sebagai speaker utama pada paket {cat_name} - {variant["name"]}. Konfigurasi {way} memberikan karakter suara yang lebih fokus pada reproduksi vocal, midrange dan detail musik.'},
                {'title': '2. Rainbow DSP EL-PA4.6', 'markdown': 'Lorem ipsum dolor sit amet. DSP berfungsi sebagai pusat pengolahan dan tuning sistem audio. Pengaturan: Crossover, EQ, Level & Gain, Phase, Time Alignment, Balance, Staging, Imaging, Integrasi speaker dengan subwoofer.'},
                {'title': '3. Kontroler DSP Rainbow EL-PA4.6', 'markdown': 'Lorem ipsum dolor sit amet. Kontroler DSP digunakan untuk mempermudah pengoperasian serta pengaturan sistem.'},
                {'title': '4. Power Mono Prototype Quarto', 'markdown': 'Lorem ipsum dolor sit amet. Power mono digunakan sebagai amplifier khusus untuk menggerakkan subwoofer.'},
                {'title': f'5. {subwoofer[:50]}', 'markdown': f'Lorem ipsum dolor sit amet. {subwoofer} digunakan untuk melengkapi frekuensi rendah yang tidak dapat dihasilkan secara optimal oleh speaker utama.'},
            ],
        },
        {
            'title': 'KONFIGURASI CHANNEL DSP',
            'type': 'subsections',
            'subsections': [
                {'title': 'DSP 6 Channel', 'markdown': 'Front: ON, Rear: OFF, Sub: ON' if tier in ['basic', 'normal'] else 'TIDAK BISA — Tidak mencukupi untuk konfigurasi yang dibutuhkan.'},
                {'title': 'DSP 8 Channel', 'markdown': 'Front: ON, Rear: OFF, Sub: ON — Sistem difokuskan pada speaker Front + Subwoofer.'},
                {'title': 'DSP 10 Channel', 'markdown': 'Front: ON, Rear: ON, Sub: ON — Konfigurasi penuh dengan Front + Rear + Subwoofer aktif.'},
            ],
        },
        {
            'title': 'B. KABEL, PILAR & BOX',
            'type': 'list',
            'items': ['BOX:', 'Box kayu simple', 'KABEL POWER:', 'Kabel aki & ground 8 AWG (65/m x 9)', 'Fuse Box ANL jepit 1 line', 'Fuse Box ANL jepit 2 line', 'Kabel remote (1 m x 5)', 'KABEL SPEAKER & SIGNAL:', 'Kabel speaker Front 16 AWG (15/m x 12)', 'Kabel Sub 16 AWG (15/m x 4)', 'Kabel input DSP 16 AWG (15/m x 10)', 'RCA SQ 2.5 m', 'PEREDAM:', 'Peredam Gran Turismo (180/lbr x 3)'],
        },
        {
            'title': 'C. JASA INSTALASI & TUNING',
            'type': 'list',
            'items': ['Jasa instalasi', 'Phase checker', 'Selang flexible kabel aki ruang mesin', 'Ring midbass + cat', 'Pembesaran plat + anti karat', 'Dudukan Fuse Box', 'Klem kabel + solder + selang bakar', 'Sealer kabel', 'Plakban tarikan pintu & kisi AC', 'Penutup cover stir', 'Wrapping plastik untuk jok & interior'],
        },
        {
            'title': 'DSP SETTING & FINAL TUNING',
            'type': 'markdown',
            'markdown': f'Lorem ipsum dolor sit amet. Setelah seluruh perangkat selesai dipasang, dilakukan proses DSP setting dan final tuning untuk paket {cat_name} - {variant["name"]}.\n\nParameter: Crossover Front, Crossover Rear, Crossover Subwoofer, EQ, Level setiap channel, Gain, Phase, Time Alignment, Balance kiri dan kanan, Integrasi speaker dengan subwoofer, Staging, Imaging, Final listening adjustment.',
        },
        {
            'title': 'TARGET HASIL SUARA',
            'type': 'markdown',
            'markdown': '**VOCAL** — Lebih jelas, fokus dan mudah dinikmati.\n\n**DETAIL** — Informasi musik lebih terdengar dengan artikulasi yang lebih jelas.\n\n**MIDBASS** — Memberikan impact dan body suara yang lebih terasa.\n\n**BASS** — Subwoofer memberikan tambahan low bass yang lebih dalam dan berisi.\n\n**STAGING & IMAGING** — DSP membantu mengatur posisi dan keseimbangan suara.\n\n**OVERALL BALANCE** — Speaker utama dan subwoofer diselaraskan melalui DSP.',
        },
        {
            'title': f'KEUNGGULAN PAKET {variant["name"].upper()}',
            'type': 'list',
            'items': [f'{speaker} {way}', 'Rainbow DSP EL-PA4.6', 'Kontroler DSP', 'Power Mono Prototype Quarto', subwoofer[:40], 'Konfigurasi Front + Sub atau Front + Rear + Sub', 'Crossover & EQ melalui DSP', 'Time Alignment & Phase Adjustment', 'Power khusus untuk subwoofer', 'Low bass lebih dalam', 'Peredam Gran Turismo', 'Phase checking', 'Instalasi kabel dan kelistrikan yang rapi', 'Final DSP tuning'],
        },
    ]

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
                    'cardTitle': f'DSP + POWER + SUB (Speaker Original)',
                    'cardDescription': f'{cat_name} - {variant["name"]}: Speaker original + DSP Rainbow + Power Mono + Subwoofer',
                    'imageUrl': var_gallery[0],
                    'imageAlt': f'{cat_name} {variant["name"]}',
                    'galleryImages': var_gallery,
                    'tagline': 'Innovation Car Audio Jakarta',
                    'introMarkdown': f'Paket {cat_name} - {variant["name"]} dengan konfigurasi DSP + Power Mono + Subwoofer. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    'sections': generate_sections(cat_name, variant, speaker, '', 'Subwoofer 8" bawah jok', '2 Way'),
                    'closingTagline': f'{variant["name"].upper()} — {cat_name}',
                    'closingComponents': [speaker, 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', 'Subwoofer 8"'],
                    'disclaimer': 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
                    'isActive': True,
                    'createdAt': now,
                    'updatedAt': now,
                })
        else:
            # Categories with sub-categories
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
                    # Price: distribute across total variants in this category
                    linear_idx = sub_idx * 4 + var_local
                    total_cat_variants = total_subs * 4
                    price = calc_price(cat['price_min'], cat['price_max'], total_cat_variants, linear_idx)
                    speaker = cat['speakers'][variant['tier']]
                    var_gallery = get_gallery_images(cat['image_base'], variant['tier'])
                    slug = f'{cat_slug}-{sub_slug}-{variant["tier"].replace("_", "-")}'

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
                        'cardTitle': f'{way} + DSP + {subwoofer[:30]}',
                        'cardDescription': f'{cat_name} - {variant["name"]}: {speaker[:30]} + DSP Rainbow + Power Mono + {subwoofer[:20]}',
                        'imageUrl': var_gallery[0],
                        'imageAlt': f'{cat_name} {sub_name} {variant["name"]}',
                        'galleryImages': var_gallery,
                        'tagline': 'Innovation Car Audio Jakarta',
                        'introMarkdown': f'Paket {cat_name} - {variant["name"]} dengan konfigurasi {way} + DSP + Power Mono + {subwoofer}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Speaker: {speaker}.',
                        'sections': generate_sections(cat_name, variant, speaker, sub_name, subwoofer, way),
                        'closingTagline': f'{variant["name"].upper()} — {cat_name} {way} + {subwoofer[:30]}',
                        'closingComponents': [speaker, 'Rainbow DSP EL-PA4.6', 'Power Mono Prototype Quarto', subwoofer[:50]],
                        'disclaimer': 'Harga non-diskon mengikuti harga yang tercantum pada brosur',
                        'isActive': True,
                        'createdAt': now,
                        'updatedAt': now,
                    })

    data['products'] = products
    data['productVariants'] = variants

    with open(BACKUP_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f'=== SEED COMPLETE ===')
    print(f'Products: {len(products)}')
    print(f'Variants: {len(variants)}')
    print(f'Backup file: {BACKUP_PATH}')
    print()
    for cat in CATEGORIES:
        cat_vars = [v for v in variants if any(p['category'] == cat['name'] and p['id'] == v['productId'] for p in products)]
        if cat_vars:
            prices = [v['priceValue'] for v in cat_vars]
            print(f'  {cat["name"]:<25}: {len(cat_vars):2d} varian | {format_price(min(prices))} - {format_price(max(prices))}')
        else:
            print(f'  {cat["name"]:<25}: 0 varian')

if __name__ == '__main__':
    main()
