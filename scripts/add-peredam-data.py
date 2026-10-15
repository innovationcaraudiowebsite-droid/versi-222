#!/usr/bin/env python3
"""
Add 4 peredam products + variants to backup-sqlite.json.
Pakai data dari file komparasi paket peredam user.
"""
import json
from pathlib import Path
from datetime import datetime

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')

# ============================================================
# Peredam package data (from user's file)
# ============================================================
PEREDAM_PACKAGES = [
    {
        'tier': 'basic',
        'name': 'Basic',
        'slug': 'peredam-basic',
        'priceOriginal': 'Rp 7.440.000',
        'priceFinal': 'Rp 6.906.000',
        'discount': '10%',
        'discountAmount': 'Rp 534.000',
        'totalLayers': 30,
        'image': '/paket-images/peredam-basic.png',
        'areas': [
            {'area': 'Pintu Depan L & R', 'layers': 'Layer 1', 'subtotal': 'Rp 740.000'},
            {'area': 'Pintu Tengah L & R', 'layers': 'Layer 1', 'subtotal': 'Rp 740.000'},
            {'area': 'Pintu Bagasi', 'layers': 'Layer 1', 'subtotal': 'Rp 280.000'},
            {'area': 'Fender Dalam Depan L & R', 'layers': 'Layer 1', 'subtotal': 'Rp 500.000'},
            {'area': 'Fender Dalam Belakang L & R', 'layers': 'Layer 2', 'subtotal': 'Rp 1.480.000'},
            {'area': 'Lantai', 'layers': 'Layer 1', 'subtotal': 'Rp 3.700.000'},
        ],
        'materials': [
            {'name': 'Gran Turismo 2.0', 'qty': 28, 'unitPrice': 'Rp 180.000', 'total': 'Rp 5.040.000'},
            {'name': 'GT Isolator Carpet 6.0', 'qty': 2, 'unitPrice': 'Rp 150.000', 'total': 'Rp 300.000'},
            {'name': 'Nitto Spoon 5mm', 'qty': 0, 'unitPrice': 'Rp 300.000', 'total': '-'},
        ],
        'installCost': 'Rp 2.100.000',
    },
    {
        'tier': 'normal',
        'name': 'Normal',
        'slug': 'peredam-normal',
        'priceOriginal': 'Rp 10.420.000',
        'priceFinal': 'Rp 9.277.000',
        'discount': '15%',
        'discountAmount': 'Rp 1.143.000',
        'totalLayers': 40,
        'image': '/paket-images/peredam-normal.png',
        'areas': [
            {'area': 'Pintu Depan L & R', 'layers': 'Layer 2', 'subtotal': 'Rp 1.480.000'},
            {'area': 'Pintu Tengah L & R', 'layers': 'Layer 2', 'subtotal': 'Rp 1.480.000'},
            {'area': 'Pintu Bagasi', 'layers': 'Layer 2', 'subtotal': 'Rp 980.000'},
            {'area': 'Fender Dalam Depan L & R', 'layers': 'Layer 1', 'subtotal': 'Rp 500.000'},
            {'area': 'Fender Dalam Belakang L & R', 'layers': 'Layer 3', 'subtotal': 'Rp 2.060.000'},
            {'area': 'Lantai', 'layers': 'Layer 1', 'subtotal': 'Rp 3.700.000'},
        ],
        'materials': [
            {'name': 'Gran Turismo 2.0', 'qty': 34, 'unitPrice': 'Rp 180.000', 'total': 'Rp 6.120.000'},
            {'name': 'GT Isolator Carpet 6.0', 'qty': 2, 'unitPrice': 'Rp 150.000', 'total': 'Rp 300.000'},
            {'name': 'Nitto Spoon 5mm', 'qty': 4, 'unitPrice': 'Rp 300.000', 'total': 'Rp 1.200.000'},
        ],
        'installCost': 'Rp 2.300.000',
    },
    {
        'tier': 'best_buy',
        'name': 'Best Buy',
        'slug': 'peredam-best-buy',
        'priceOriginal': 'Rp 13.420.000',
        'priceFinal': 'Rp 10.915.000',
        'discount': '25%',
        'discountAmount': 'Rp 2.505.000',
        'totalLayers': 52,
        'image': '/paket-images/peredam-best-buy.png',
        'areas': [
            {'area': 'Pintu Depan L & R', 'layers': 'Layer 3', 'subtotal': 'Rp 2.220.000'},
            {'area': 'Pintu Tengah L & R', 'layers': 'Layer 3', 'subtotal': 'Rp 2.220.000'},
            {'area': 'Pintu Bagasi', 'layers': 'Layer 2', 'subtotal': 'Rp 980.000'},
            {'area': 'Fender Dalam Depan L & R', 'layers': 'Layer 1', 'subtotal': 'Rp 500.000'},
            {'area': 'Fender Dalam Belakang L & R', 'layers': 'Layer 4', 'subtotal': 'Rp 2.640.000'},
            {'area': 'Lantai', 'layers': 'Layer 1', 'subtotal': 'Rp 3.700.000'},
        ],
        'materials': [
            {'name': 'Gran Turismo 2.0', 'qty': 44, 'unitPrice': 'Rp 180.000', 'total': 'Rp 7.920.000'},
            {'name': 'GT Isolator Carpet 6.0', 'qty': 2, 'unitPrice': 'Rp 150.000', 'total': 'Rp 300.000'},
            {'name': 'Nitto Spoon 5mm', 'qty': 6, 'unitPrice': 'Rp 300.000', 'total': 'Rp 1.800.000'},
        ],
        'installCost': 'Rp 2.600.000',
    },
    {
        'tier': 'recommended',
        'name': 'Recommended',
        'slug': 'peredam-recommended',
        'priceOriginal': 'Rp 18.220.000',
        'priceFinal': 'Rp 13.243.000',
        'discount': '35%',
        'discountAmount': 'Rp 4.977.000',
        'totalLayers': 66,
        'image': '/paket-images/peredam-recommended.png',
        'areas': [
            {'area': 'Pintu Depan L & R', 'layers': 'Layer 4', 'subtotal': 'Rp 2.960.000'},
            {'area': 'Pintu Tengah L & R', 'layers': 'Layer 4', 'subtotal': 'Rp 2.960.000'},
            {'area': 'Pintu Bagasi', 'layers': 'Layer 2', 'subtotal': 'Rp 980.000'},
            {'area': 'Fender Dalam Depan L & R', 'layers': 'Layer 1', 'subtotal': 'Rp 500.000'},
            {'area': 'Fender Dalam Belakang L & R', 'layers': 'Layer 5', 'subtotal': 'Rp 3.220.000'},
            {'area': 'Lantai', 'layers': 'Layer 1', 'subtotal': 'Rp 3.700.000'},
        ],
        'materials': [
            {'name': 'Gran Turismo 2.0', 'qty': 44, 'unitPrice': 'Rp 180.000', 'total': 'Rp 7.920.000'},
            {'name': 'GT Isolator Carpet 6.0', 'qty': 2, 'unitPrice': 'Rp 150.000', 'total': 'Rp 300.000'},
            {'name': 'Nitto Spoon 5mm', 'qty': 20, 'unitPrice': 'Rp 300.000', 'total': 'Rp 6.000.000'},
        ],
        'installCost': 'Rp 4.000.000',
    },
]

# Optional add-on items (same for all tiers)
OPTIONAL_ITEMS = [
    {
        'name': 'Front Fender Exterior L & R',
        'description': 'Rainbow SL-D 2.1 (Buttyl) + GT Isolator Carpet 6.0',
        'price': 'Rp 956.000',
    },
    {
        'name': 'Rear Fender Exterior L & R',
        'description': 'Rainbow SL-D 2.1 (Buttyl) + GT Isolator Carpet 6.0',
        'price': 'Rp 1.208.000',
    },
    {
        'name': 'Peredam Plafon',
        'description': 'Gran Turismo 2.0 × 6 lbr + biaya instalasi',
        'price': 'Rp 1.472.000',
    },
]


def main():
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    # Add peredam data as a new top-level key
    data['peredamPackages'] = PEREDAM_PACKAGES
    data['peredamOptional'] = OPTIONAL_ITEMS

    # Update meta
    data['_meta']['counts']['peredamPackages'] = len(PEREDAM_PACKAGES)

    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f'✓ Added {len(PEREDAM_PACKAGES)} peredam packages')
    print(f'✓ Added {len(OPTIONAL_ITEMS)} optional items')
    print(f'✓ Saved to {BACKUP_FILE}')

    # Verify
    print()
    for p in PEREDAM_PACKAGES:
        print(f'  {p["name"]:15s} | {p["priceOriginal"]:20s} → {p["priceFinal"]:20s} | {p["totalLayers"]} lbr')


if __name__ == '__main__':
    main()
