#!/usr/bin/env python3
"""
Optimize brand logos aggressively using palette (P) mode PNG which is much
smaller than RGBA for logos with limited colors.
"""
import os
from pathlib import Path
from io import BytesIO
from PIL import Image

LOGO_DIR = Path("/home/z/my-project/public/brand-logos")
TARGET_SIZE = (400, 200)


def autocrop(img, pad=8):
    """Crop transparent borders from RGBA image, with small padding."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        x0 = max(0, x0 - pad)
        y0 = max(0, y0 - pad)
        x1 = min(img.width, x1 + pad)
        y1 = min(img.height, y1 + pad)
        img = img.crop((x0, y0, x1, y1))
    return img


def resize_to_fit(img, target_w, target_h):
    """Resize image to fit within target box, preserving aspect ratio."""
    w, h = img.size
    if w / h > target_w / target_h:
        new_w = target_w
        new_h = max(1, int(target_w * h / w))
    else:
        new_h = target_h
        new_w = max(1, int(target_h * w / h))
    return img.resize((new_w, new_h), Image.LANCZOS)


def make_canvas(img, target_w, target_h):
    """Place image on transparent canvas centered."""
    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    paste_x = (target_w - img.width) // 2
    paste_y = (target_h - img.height) // 2
    canvas.paste(img, (paste_x, paste_y), img)
    return canvas


def save_best(img_rgba, path, target_kb=5):
    """Try multiple strategies and save the smallest PNG."""
    candidates = []

    # Strategy 1: RGBA PNG, full optimize
    buf = BytesIO()
    img_rgba.save(buf, format="PNG", optimize=True)
    candidates.append(("RGBA", buf.getvalue()))

    # Strategy 2: P mode with various color counts
    for colors in [64, 32, 16, 8, 4]:
        try:
            img_p = img_rgba.quantize(colors=colors, method=Image.FASTOCTREE)
            buf2 = BytesIO()
            # Need to handle transparency: find the transparent palette index
            # The quantize method may use the first index for fully transparent
            img_p.save(buf2, format="PNG", optimize=True)
            candidates.append((f"P{colors}", buf2.getvalue()))
        except Exception:
            pass

    # Pick smallest
    best_name, best_data = min(candidates, key=lambda x: len(x[1]))
    Path(path).write_bytes(best_data)
    return best_name, len(best_data)


def process_one(path):
    """Optimize one logo PNG."""
    img = Image.open(path)
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    original_size = path.stat().st_size
    original_dims = img.size

    img = autocrop(img, pad=6)
    img = resize_to_fit(img, TARGET_SIZE[0], TARGET_SIZE[1])
    canvas = make_canvas(img, TARGET_SIZE[0], TARGET_SIZE[1])

    best_name, new_size = save_best(canvas, path, target_kb=5)
    return original_dims, original_size, canvas.size, new_size, best_name


def main():
    files = sorted(LOGO_DIR.glob("*.png"))
    print(f"Optimizing {len(files)} logos (aggressive palette mode)...")
    print(f"{'Brand':<25} {'Before':<18} {'After':<18} {'Mode':<8} {'Size':<8}")
    print("-" * 90)
    total_before = 0
    total_after = 0
    for f in files:
        before_dims, before_size, after_dims, after_size, mode = process_one(f)
        total_before += before_size
        total_after += after_size
        print(f"{f.name:<25} {before_dims[0]}x{before_dims[1]} {before_size:>6}B  "
              f"{after_dims[0]}x{after_dims[1]} {after_size:>6}B  "
              f"{mode:<8} {after_size/1024:.1f}KB")
    print("-" * 90)
    print(f"{'TOTAL':<25} {total_before:>8}B                  "
          f"{total_after:>8}B              {total_after/1024:.1f}KB")


if __name__ == "__main__":
    main()
