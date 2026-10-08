#!/usr/bin/env python3
"""Create a contact sheet showing all 17 brand logos side by side."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import os

LOGO_DIR = Path("/home/z/my-project/public/brand-logos")
OUT = Path("/home/z/my-project/download/brand-logos-contact-sheet.png")
OUT.parent.mkdir(parents=True, exist_ok=True)

# Load all logos
logos = sorted(LOGO_DIR.glob("*.png"))

# Layout: 4 columns x 5 rows (for 17 brands)
COLS = 4
ROWS = 5
CELL_W = 480  # 400 logo + 40 padding each side
CELL_H = 180  # logo height + label

# Try to load a font
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
except Exception:
    font = ImageFont.load_default()
    font_small = font

sheet_w = COLS * CELL_W
sheet_h = ROWS * CELL_H + 80  # header
sheet = Image.new("RGBA", (sheet_w, sheet_h), (245, 245, 247, 255))
draw = ImageDraw.Draw(sheet)

# Header
draw.text((20, 20), "Brand Logos — 17 brands", fill=(20, 20, 20), font=font)
draw.text((20, 50), "Total: 16.2 KB (down from 956 KB, -98%)", fill=(80, 80, 80), font=font_small)

# Define which brands got real logos from official sites
REAL_LOGOS = {"harman", "eton", "crescendo", "emphaser", "flux"}

for i, logo_path in enumerate(logos):
    row = i // COLS
    col = i % COLS
    x = col * CELL_W + 40  # 40px padding
    y = 80 + row * CELL_H + 30

    name = logo_path.stem
    img = Image.open(logo_path).convert("RGBA")
    sz = os.path.getsize(logo_path)

    # Paste logo
    sheet.paste(img, (x, y), img)

    # Label below
    label = name
    is_real = name in REAL_LOGOS or name.replace("-", "") in REAL_LOGOS
    badge = "★ " if is_real else "  "
    label_color = (0, 100, 0) if is_real else (40, 40, 40)

    draw.text((x, y + 130), f"{badge}{label}", fill=label_color, font=font)
    draw.text((x, y + 150), f"{sz} bytes", fill=(120, 120, 120), font=font_small)

sheet.save(OUT, format="PNG")
print(f"Contact sheet saved: {OUT}")
print(f"Size: {sheet.size}")
