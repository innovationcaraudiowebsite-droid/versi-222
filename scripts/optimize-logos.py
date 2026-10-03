#!/usr/bin/env python3
"""
Optimize brand logos: crop to content, resize, quantize to keep file size small (~3-5KB each).
"""
import os
from pathlib import Path
from io import BytesIO
from PIL import Image

LOGO_DIR = Path("/home/z/my-project/public/brand-logos")
TARGET_SIZE = (400, 200)  # canvas size
TARGET_KB = 5  # max file size per logo


def autocrop(img):
    """Crop transparent borders from RGBA image."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        # Add small padding
        pad = 8
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


def save_optimized(img, path, target_kb=5):
    """Save PNG, trying multiple quantization levels to hit target size."""
    # Save with full optimization first
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    data = buf.getvalue()
    best_data = data

    # If too large, try quantizing with fewer colors
    if len(data) > target_kb * 1024:
        for colors in [128, 64, 32, 16]:
            try:
                img_q = img.quantize(colors=colors, method=Image.FASTOCTREE).convert("RGBA")
                buf2 = BytesIO()
                img_q.save(buf2, format="PNG", optimize=True)
                data2 = buf2.getvalue()
                # Keep the smallest result that's still good quality
                if len(data2) < len(best_data):
                    best_data = data2
                if len(best_data) <= target_kb * 1024:
                    break
            except Exception:
                continue

    Path(path).write_bytes(best_data)
    return len(best_data)


def process_one(path):
    """Optimize one logo PNG."""
    img = Image.open(path)
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    original_size = path.stat().st_size
    original_dims = img.size

    # Step 1: Auto-crop transparent borders
    img = autocrop(img)

    # Step 2: Resize to fit within 400x200, preserving aspect
    img = resize_to_fit(img, TARGET_SIZE[0], TARGET_SIZE[1])

    # Step 3: Place on 400x200 canvas
    canvas = make_canvas(img, TARGET_SIZE[0], TARGET_SIZE[1])

    # Step 4: Save optimized
    new_size = save_optimized(canvas, path, target_kb=TARGET_KB)

    return original_dims, original_size, canvas.size, new_size


def main():
    files = sorted(LOGO_DIR.glob("*.png"))
    print(f"Optimizing {len(files)} logos...")
    print(f"{'Brand':<25} {'Before':<20} {'After':<20} {'Size':<10}")
    print("-" * 80)
    total_before = 0
    total_after = 0
    for f in files:
        before_dims, before_size, after_dims, after_size = process_one(f)
        total_before += before_size
        total_after += after_size
        name = f.name
        print(f"{name:<25} {before_dims[0]}x{before_dims[1]} {before_size:>6}B  "
              f"{after_dims[0]}x{after_dims[1]} {after_size:>6}B  "
              f"{after_size/1024:.1f}KB")
    print("-" * 80)
    print(f"{'TOTAL':<25} {total_before:>8}B                    "
          f"{total_after:>8}B  {total_after/1024:.1f}KB")


if __name__ == "__main__":
    main()
