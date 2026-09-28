#!/usr/bin/env python3
"""
Update backup-sqlite.json: replace Unsplash URLs dengan local path.
Setiap varian dapat:
  - imageUrl: /product-images/{slug}-1.png (main image)
  - galleryImages: [
      /product-images/{slug}-1.png,
      /product-images/{slug}-2.png,
      /product-images/{slug}-3.png,
      /product-images/{slug}-4.png
    ]
"""

import json

BACKUP_PATH = 'data/backup-sqlite.json'

with open(BACKUP_PATH, 'r') as f:
    data = json.load(f)

variants = data.get('productVariants', [])
print(f"=== Updating {len(variants)} variants ===")
print()

updated_count = 0
for v in variants:
    slug = v.get('slug')
    if not slug:
        continue

    new_image_url = f"/product-images/{slug}-1.png"
    new_gallery = [
        f"/product-images/{slug}-1.png",
        f"/product-images/{slug}-2.png",
        f"/product-images/{slug}-3.png",
        f"/product-images/{slug}-4.png",
    ]

    old_url = v.get('imageUrl', '')
    old_gallery_count = len(v.get('galleryImages', []))

    v['imageUrl'] = new_image_url
    v['galleryImages'] = new_gallery
    updated_count += 1

    print(f"  ✓ {slug}")
    print(f"    imageUrl: {old_url[:60]}... → {new_image_url}")
    print(f"    galleryImages: {old_gallery_count} items → {len(new_gallery)} local paths")

# Also update parent product imageUrl to use first variant's image
products = data.get('products', [])
print()
print(f"=== Updating {len(products)} parent products ===")
print()
for p in products:
    p_id = p['id']
    # Find first variant of this product
    first_variant = next((v for v in variants if v.get('productId') == p_id), None)
    if first_variant:
        new_parent_image = f"/product-images/{first_variant['slug']}-1.png"
        old_parent = p.get('imageUrl', '')
        p['imageUrl'] = new_parent_image
        print(f"  ✓ {p['name']} → {new_parent_image}")

# Write back
with open(BACKUP_PATH, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print()
print("=" * 60)
print("=== SUMMARY ===")
print("=" * 60)
print(f"  Variants updated: {updated_count}")
print(f"  Products updated: {len(products)}")
print(f"  Backup file: {BACKUP_PATH}")
print()
print("All Unsplash URLs replaced with local /product-images/ paths")
