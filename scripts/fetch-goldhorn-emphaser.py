#!/usr/bin/env python3
"""Process brand logos: download from URL, optimize, save to public/brand-logos/"""
import os, sys
import requests
import urllib3
from PIL import Image
from io import BytesIO
import cairosvg

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
HEADERS = {"User-Agent": UA}

LOGO_DIR = "/home/z/my-project/public/brand-logos"
TARGET_SIZE = (400, 200)


def download_image(url):
    """Download image bytes from URL. If SVG, rasterize."""
    print(f"  Downloading: {url}")
    r = requests.get(url, headers=HEADERS, timeout=20, verify=False, allow_redirects=True)
    if r.status_code != 200 or not r.content:
        print(f"    FAILED: HTTP {r.status_code}")
        return None
    print(f"    Got: {len(r.content)} bytes")
    
    # Check if SVG (by URL or content)
    if url.lower().endswith(".svg") or b"<svg" in r.content[:500].lower():
        print(f"    Detected SVG, rasterizing...")
        try:
            png_bytes = cairosvg.svg2png(
                bytestring=r.content,
                output_width=800,
                output_height=400,
                background_color=None,  # transparent
            )
            print(f"    Rasterized: {len(png_bytes)} bytes PNG")
            return png_bytes
        except Exception as e:
            print(f"    SVG rasterize failed: {e}")
            return None
    return r.content


def optimize_to_png(img_bytes, target_size=TARGET_SIZE, min_colors=16):
    """Convert raw image to optimized RGBA PNG on target_size canvas."""
    try:
        img = Image.open(BytesIO(img_bytes))
        img.load()
        print(f"    Image: {img.format} {img.size} mode={img.mode}")
    except Exception as e:
        print(f"    Image open failed: {e}")
        return None

    img = img.convert("RGBA")
    
    # Auto-crop transparent borders
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        pad = 8
        x0 = max(0, bbox[0] - pad)
        y0 = max(0, bbox[1] - pad)
        x1 = min(img.width, bbox[2] + pad)
        y1 = min(img.height, bbox[3] + pad)
        img = img.crop((x0, y0, x1, y1))
    print(f"    Cropped: {img.size}")
    
    # Resize to fit 400x200 preserving aspect
    w, h = img.size
    tw, th = target_size
    if w / h > tw / th:
        new_w = tw
        new_h = max(1, int(tw * h / w))
    else:
        new_h = th
        new_w = max(1, int(th * w / h))
    img = img.resize((new_w, new_h), Image.LANCZOS)
    print(f"    Resized: {img.size}")
    
    # Center on canvas
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    canvas.paste(img, ((tw - new_w) // 2, (th - new_h) // 2), img)
    
    # Save with palette mode optimization
    candidates = []
    buf = BytesIO()
    canvas.save(buf, format="PNG", optimize=True)
    candidates.append(("RGBA", buf.getvalue()))
    
    for colors in [64, 32, 16, 8]:
        if colors < min_colors:
            continue
        try:
            img_p = canvas.quantize(colors=colors, method=Image.FASTOCTREE)
            buf2 = BytesIO()
            img_p.save(buf2, format="PNG", optimize=True)
            candidates.append((f"P{colors}", buf2.getvalue()))
        except Exception:
            pass
    
    # Pick smallest
    best_name, best_data = min(candidates, key=lambda x: len(x[1]))
    return canvas, best_name, best_data


def process_brand(slug, url):
    """Process one brand: download, optimize, save."""
    print(f"\n=== {slug} ===")
    
    img_bytes = download_image(url)
    if not img_bytes:
        return False
    
    result = optimize_to_png(img_bytes, min_colors=16)
    if not result:
        return False
    canvas, mode, data = result
    
    out_path = f"{LOGO_DIR}/{slug}.png"
    with open(out_path, "wb") as f:
        f.write(data)
    print(f"  ✓ SAVED: {out_path} ({mode}, {len(data)} bytes)")
    
    # Verify colors
    img_check = Image.open(out_path).convert("RGBA")
    non_trans = [p for p in img_check.getdata() if p[3] > 50]
    unique = sorted(set(non_trans))
    print(f"  Final: {img_check.size}, {len(unique)} unique colors")
    for c in unique[:6]:
        print(f"    RGB({c[0]:3d},{c[1]:3d},{c[2]:3d}) a={c[3]}")
    return True


# Brands to process
BRANDS = {
    "goldhorn": "https://www.goldhornaudio.com/zb_users/upload/2023/07/202307261690330224552718.png",
    # Note: Emphaser logo is already correctly downloaded, no need to redo.
    # User provided emphaser URL for reference but logo is the same as before.
    # "emphaser": "https://emphaser.com/wp-content/themes/emphaser/assets/images/logo.svg",
}


def main():
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(BRANDS.keys())
    for slug in targets:
        if slug not in BRANDS:
            print(f"Unknown brand: {slug}")
            continue
        process_brand(slug, BRANDS[slug])


if __name__ == "__main__":
    main()
