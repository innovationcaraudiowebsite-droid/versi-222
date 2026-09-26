#!/usr/bin/env python3
"""
Update Simple Upgrade mock data:
1. Update harga 3 varian yang ada (Basic, Normal, Best Buy)
2. Tambah varian baru Recommended dengan harga Rp 16.500.000

Sesuai input user:
- Basic: Rp 13.500.000
- Normal: Rp 14.800.000
- Best Buy: Rp 16.500.000
- Recommended: Rp 16.500.000
"""

import json
import uuid
from datetime import datetime, timezone

NEW_PRICES = {
    'basic': ('Rp 13.500.000', 13500000),
    'normal': ('Rp 14.800.000', 14800000),
    'best_buy': ('Rp 16.500.000', 16500000),
    'recommended': ('Rp 16.500.000', 16500000),
}

# Backup file
backup_path = 'data/backup-sqlite.json'

with open(backup_path, 'r') as f:
    data = json.load(f)

# Find Simple Upgrade product
simple_upgrade = None
for p in data.get('products', []):
    if 'Simple Upgrade' in p.get('name', ''):
        simple_upgrade = p
        break

if not simple_upgrade:
    print("ERROR: Simple Upgrade product not found")
    exit(1)

print(f"=== Updating Simple Upgrade (ID: {simple_upgrade['id']}) ===")
print()

# Update existing variants
variants = data.get('productVariants', [])
simple_variants = [v for v in variants if v.get('productId') == simple_upgrade['id']]

print("Existing variants BEFORE update:")
for v in simple_variants:
    print(f"  {v['name']:12} ({v['tier']:11}) — {v['price']:18} | priceValue: {v.get('priceValue')}")

print()
print("Applying updates:")

for v in simple_variants:
    tier = v['tier']
    if tier in NEW_PRICES:
        old_price = v['price']
        new_price, new_value = NEW_PRICES[tier]
        v['price'] = new_price
        v['priceValue'] = new_value
        v['updatedAt'] = datetime.now(timezone.utc).isoformat()
        print(f"  ✓ {v['name']:12} ({tier:11}) — {old_price} → {new_price}")

# Add Recommended variant if not exists
has_recommended = any(v['tier'] == 'recommended' for v in simple_variants)
if not has_recommended:
    print()
    print("Adding Recommended variant (new):")
    
    # Use Best Buy as template (clone data, change tier + price)
    best_buy_template = next((v for v in simple_variants if v['tier'] == 'best_buy'), None)
    if best_buy_template:
        import copy
        new_recommended = copy.deepcopy(best_buy_template)
        new_recommended['id'] = f"var-{uuid.uuid4().hex[:8]}"
        new_recommended['name'] = 'Recommended'
        new_recommended['slug'] = f"{simple_upgrade['slug']}-recommended"
        new_recommended['tier'] = 'recommended'
        new_recommended['sortOrder'] = 4
        new_recommended['price'] = NEW_PRICES['recommended'][0]
        new_recommended['priceValue'] = NEW_PRICES['recommended'][1]
        new_recommended['ribbonLabel'] = 'RECOMMENDED'
        new_recommended['ribbonColor'] = 'emerald'
        new_recommended['cardTitle'] = 'SPEAKER ORIGINAL + DSP + POWER + SUB 10"'
        new_recommended['cardDescription'] = 'Speaker original tetap dipakai + DSP Rainbow Controller + Power Mono + Sub 10" + Peredam Gran Turismo. Konfigurasi terlengkap.'
        new_recommended['closingTagline'] = 'RECOMMENDED — Complete Upgrade dengan Speaker Original + Subwoofer 10"'
        new_recommended['disclaimer'] = 'Harga non-diskon mengikuti harga yang tercantum pada brosur.'
        new_recommended['createdAt'] = datetime.now(timezone.utc).isoformat()
        new_recommended['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        # Add to variants list
        variants.append(new_recommended)
        data['productVariants'] = variants
        print(f"  ✓ Added: {new_recommended['name']} ({new_recommended['tier']}) — {new_recommended['price']}")
        print(f"    Slug: /produk/{new_recommended['slug']}")
        print(f"    Ribbon: {new_recommended['ribbonLabel']} ({new_recommended['ribbonColor']})")
        print(f"    Sort Order: {new_recommended['sortOrder']}")

# Write back
with open(backup_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print()
print("=" * 60)
print("=== Final Simple Upgrade variants (4) ===")
final_variants = [v for v in data['productVariants'] if v.get('productId') == simple_upgrade['id']]
for v in sorted(final_variants, key=lambda x: x['sortOrder']):
    print(f"  {v['name']:12} ({v['tier']:11}) — {v['price']:18} | priceValue: {v.get('priceValue')} | ribbon: {v.get('ribbonLabel')}")

print()
print(f"Total products: {len(data.get('products', []))}")
print(f"Total variants: {len(data.get('productVariants', []))}")
print(f"Backup file: {backup_path}")
