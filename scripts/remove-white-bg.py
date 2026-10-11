#!/usr/bin/env python3
"""
Remove white backgrounds from brand logos that have them baked into the PNG.
Convert white pixels to transparent, keeping anti-aliased edges smooth.

Strategy: For each pixel, blend the alpha channel based on how "white" it is.
Pure white → fully transparent. Colored pixels → fully opaque.
Edge pixels (anti-aliased) → partial transparency.
"""
from PIL import Image
from pathlib import Path

LOGO_DIR = Path('/home/z/my-project/public/brand-logos')

# Brands to process (those with >80% white pixels)
TARGETS = ['crescendo', 'phd', 'rainbow', 'blam']


def remove_white_bg(img):
    """Convert white pixels to transparent, keeping anti-aliased edges smooth."""
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    data = img.getdata()
    new_data = []

    for r, g, b, a in data:
        # Skip already-transparent pixels
        if a < 10:
            new_data.append((r, g, b, a))
            continue

        # Calculate "whiteness" — how close to white (255,255,255)
        # Use the minimum channel value (if any channel is low, it's not white)
        min_channel = min(r, g, b)
        max_channel = max(r, g, b)

        # If very white (all channels > 230)
        if min_channel > 230 and max_channel > 240:
            # Fully white → fully transparent
            new_data.append((r, g, b, 0))
        # Near-white (anti-aliased edge) — partial transparency
        elif min_channel > 200 and max_channel > 220:
            # Calculate alpha based on how white it is
            whiteness = (min_channel + max_channel) / 2
            # Map 200→255 to 255→0 (more white = more transparent)
            new_alpha = int(a * (255 - whiteness) / 55)
            new_alpha = max(0, min(255, new_alpha))
            new_data.append((r, g, b, new_alpha))
        else:
            # Colored pixel — keep fully opaque
            new_data.append((r, g, b, a))

    img.putdata(new_data)
    return img


def main():
    for name in TARGETS:
        path = LOGO_DIR / f'{name}.png'
        if not path.exists():
            print(f'  SKIP {name} (file not found)')
            continue

        img = Image.open(path)
        original_size = path.stat().st_size

        # Check white pixel percentage before
        img_rgba = img.convert('RGBA')
        pixels = list(img_rgba.getdata())
        non_trans = [p for p in pixels if p[3] > 200]
        white_before = len([p for p in non_trans if p[0] > 240 and p[1] > 240 and p[2] > 240])

        # Process
        img = remove_white_bg(img)

        # Save (preserve palette mode if original was P)
        if Image.open(path).mode == 'P':
            img = img.quantize(colors=32, method=Image.FASTOCTREE)

        img.save(path, format='PNG', optimize=True)
        new_size = path.stat().st_size

        # Verify
        img2 = Image.open(path).convert('RGBA')
        pixels2 = list(img2.getdata())
        non_trans2 = [p for p in pixels2 if p[3] > 200]
        white_after = len([p for p in non_trans2 if p[0] > 240 and p[1] > 240 and p[2] > 240])

        print(f'  {name:15s}: white {white_before} → {white_after} pixels, '
              f'size {original_size} → {new_size} bytes')


if __name__ == '__main__':
    main()
