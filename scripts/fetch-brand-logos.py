#!/usr/bin/env python3
"""
Fetch brand logos from official websites.
Strategy:
  1. Fetch HTML from each brand's official website (SSL verify off).
  2. Parse to find logo candidates (img with "logo" in src/alt/class, svg in header).
  3. Download the best candidate, optimize to PNG transparent, 400x200, ~3-5KB.
"""
import os, sys, re, json, time, urllib3
from pathlib import Path
from io import BytesIO
import requests
from bs4 import BeautifulSoup
from PIL import Image
import cairosvg

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
HEADERS = {"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"}

OUT_DIR = Path("/home/z/my-project/public/brand-logos")
OUT_DIR.mkdir(parents=True, exist_ok=True)
TMP_DIR = Path("/tmp/brand-logos-raw")
TMP_DIR.mkdir(parents=True, exist_ok=True)

# Brand → website URL + brand color (for fallback coloring)
BRANDS = {
    "infinity":     {"url": "https://infinitykappa.com/",                "color": "#e40014"},
    "harman":       {"url": "https://www.harman.com/",                     "color": "#ff5500"},
    "rainbow":      {"url": "https://www.rainbow-audio.de/",              "color": "#e6c200"},
    "gz":           {"url": "https://www.groundzeroaudio.de/",             "color": "#cc0000"},
    "blam":         {"url": "https://www.blam-audio.com/",                 "color": "#1a1a1a"},
    "phd":          {"url": "https://www.phdaudio.com/",                   "color": "#0066cc"},
    "eton":         {"url": "https://www.eton.de/",                        "color": "#003366"},
    "crescendo":    {"url": "https://www.crescendoaudio.com/",             "color": "#8b0000"},
    "goldhorn":     {"url": "https://www.goldhorn-audio.com/",             "color": "#d4af37"},
    "zevox":        {"url": "https://zevox.net/",                          "color": "#1a1a1a"},
    "gran-turismo": {"url": "https://gran-turismo.com/",                   "color": "#c41e3a"},
    "silent-coat":  {"url": "https://www.silentcoat.com/",                 "color": "#003399"},
    "recoil":       {"url": "https://www.recoilaudio.com/",                "color": "#2c3e50"},
    "emphaser":     {"url": "https://www.emphaser.com/",                   "color": "#8b0000"},
    "reverb":       {"url": "https://www.reverbaudio.com/",                "color": "#4a0080"},
    "flux":         {"url": "https://www.flux-audio.com/",                 "color": "#0066cc"},
    "dl-audio-lab": {"url": "https://www.dlaudiolab.com/",                 "color": "#1a1a1a"},
}


def fetch(url, timeout=10):
    """Fetch URL with SSL verify off."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout, verify=False, allow_redirects=True)
        return r
    except Exception as e:
        return None


def find_logo_candidates(html, base_url, slug=""):
    """Find logo image URLs in HTML."""
    soup = BeautifulSoup(html, "html.parser")
    candidates = []  # (priority, url, src, alt)

    # Strategy 1: img tags with "logo" in src/alt/class
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src") or ""
        if not src:
            continue
        alt = (img.get("alt") or "").lower()
        cls = " ".join(img.get("class") or []).lower()
        src_low = src.lower()

        # Score this candidate
        score = 0
        if "logo" in src_low:    score += 50
        if "logo" in alt:        score += 30
        if "logo" in cls:        score += 20
        if "header" in cls or "header" in src_low:  score += 10
        if "brand" in cls or "brand" in src_low:    score += 10
        if " retina" in cls:                            score += 5
        if "site" in src_low:    score -= 5

        # Avoid icons/favicons
        if "favicon" in src_low or "icon-" in src_low: score -= 50
        if "avatar" in src_low or "user" in src_low:   score -= 50

        # Skip clearly non-logo items: social media icons, payment icons, etc.
        skip_keywords = ("twitter", "facebook", "instagram", "youtube", "linkedin",
                         "tiktok", "wechat", "whatsapp", "telegram", "pinterest",
                         "payment", "paypal", "visa", "master", "amex",
                         "arrow-", "icon-", "btn-", "button-", "search-",
                         "flag-", "hamburger", "menu-", "cart-", "burger",
                         "slider", "banner", "hero-", "background", "pattern")
        if any(k in src_low for k in skip_keywords):
            score -= 100
        if any(k in alt for k in skip_keywords):
            score -= 100

        # Boost: prefer common logo file names
        if src_low.rstrip('/').endswith((".svg", "logo.svg", "logo.png", "logo.jpg")):
            score += 20
        # Boost: brand-name in src
        if slug:
            brand_part = slug.split('-')[0]
            if brand_part in src_low:
                score += 15

        if score > 0:
            # Make absolute URL
            abs_url = requests.compat.urljoin(base_url, src)
            candidates.append((score, abs_url, src, alt))

    # Strategy 2: SVG logos (often inline or referenced)
    for svg in soup.find_all("svg"):
        cls = " ".join(svg.get("class") or []).lower()
        if "logo" in cls or "brand" in cls:
            candidates.append((60, base_url + "#svg-inline", "svg", cls))

    # Strategy 3: link rel=image_src or apple-touch-icon
    for link in soup.find_all("link"):
        rel = (link.get("rel") or [])
        href = link.get("href") or ""
        if not href:
            continue
        rel_str = " ".join(rel).lower()
        if "apple-touch-icon" in rel_str or "fluid-icon" in rel_str:
            abs_url = requests.compat.urljoin(base_url, href)
            candidates.append((20, abs_url, href, rel_str))

    # Dedupe by URL
    seen = set()
    deduped = []
    for c in candidates:
        if c[1] in seen:
            continue
        seen.add(c[1])
        deduped.append(c)

    return sorted(deduped, reverse=True)


def download_image(url, timeout=15):
    """Download image bytes from URL. If SVG, rasterize to PNG."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout, verify=False, allow_redirects=True)
        if r.status_code != 200 or not r.content:
            return None
        # If SVG, rasterize
        if url.lower().endswith(".svg") or b"<svg" in r.content[:200].lower():
            try:
                png_bytes = cairosvg.svg2png(
                    bytestring=r.content,
                    output_width=800,
                    output_height=400,
                    background_color=None,
                )
                return png_bytes
            except Exception as e:
                print(f"    SVG rasterize failed: {e}")
                return None
        return r.content
    except Exception:
        return None


def optimize_logo(img_bytes, target_size=(400, 200), bg_color=None):
    """Convert raw image bytes to optimized RGBA PNG (transparent bg, small size)."""
    try:
        img = Image.open(BytesIO(img_bytes))
    except Exception:
        return None

    # Convert to RGBA
    img = img.convert("RGBA")
    w, h = img.size

    # If image is very wide (logo-like), keep aspect; else square-crop
    # Resize to fit within target_size while preserving aspect
    target_w, target_h = target_size
    if w / h > target_w / target_h:
        # Image is wider than target ratio
        new_w = target_w
        new_h = int(target_w * h / w)
    else:
        new_h = target_h
        new_w = int(target_h * w / h)
    new_w = max(new_w, 1)
    new_h = max(new_h, 1)

    # Resize with LANCZOS for quality
    img = img.resize((new_w, new_h), Image.LANCZOS)

    # Create canvas of target size with transparency
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    paste_x = (target_size[0] - new_w) // 2
    paste_y = (target_size[1] - new_h) // 2
    canvas.paste(img, (paste_x, paste_y), img)

    return canvas


def save_png(img, path, target_kb=5):
    """Save PNG with optimization, aiming for small file size."""
    # First save normally
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    data = buf.getvalue()

    # If too large, reduce colors (FASTOCTREE works with RGBA)
    if len(data) > target_kb * 1024:
        try:
            img_p = img.quantize(colors=64, method=Image.FASTOCTREE).convert("RGBA")
            buf2 = BytesIO()
            img_p.save(buf2, format="PNG", optimize=True)
            data2 = buf2.getvalue()
            if len(data2) < len(data):
                data = data2
        except Exception:
            pass

    Path(path).write_bytes(data)
    return len(data)


def process_brand(slug, brand_info):
    """Process one brand: fetch site, find logo, download, optimize, save."""
    url = brand_info["url"]
    print(f"\n--- {slug}: {url}")

    r = fetch(url, timeout=15)
    if r is None or r.status_code >= 500:
        print(f"  ✗ Failed to fetch site (HTTP {r.status_code if r else 'no resp'})")
        return None

    html = r.text
    print(f"  HTML: {len(html)} bytes")

    candidates = find_logo_candidates(html, url, slug=slug)
    print(f"  Found {len(candidates)} logo candidates")

    for i, (score, c_url, src, alt) in enumerate(candidates[:5]):
        print(f"    [{i+1}] score={score} alt='{alt[:30]}' src={src[:80]}")

    if not candidates:
        return None

    # Try downloading each candidate until one works
    for score, c_url, src, alt in candidates:
        if c_url.endswith("#svg-inline"):
            continue  # can't download inline SVG
        print(f"  Trying: {c_url[:100]}")
        img_bytes = download_image(c_url, timeout=15)
        if not img_bytes:
            continue
        print(f"    Downloaded {len(img_bytes)} bytes")
        # Check it's actually an image
        try:
            test = Image.open(BytesIO(img_bytes))
            test.load()
            print(f"    Valid image: {test.format} {test.size} mode={test.mode}")
        except Exception as e:
            print(f"    Not a valid image: {e}")
            continue

        # Optimize
        canvas = optimize_logo(img_bytes, target_size=(400, 200), bg_color=brand_info["color"])
        if canvas is None:
            continue

        out_path = OUT_DIR / f"{slug}.png"
        size = save_png(canvas, out_path)
        print(f"  ✓ SAVED {out_path} ({size} bytes)")
        return out_path

    return None


def main():
    results = {}
    for slug, info in BRANDS.items():
        result = process_brand(slug, info)
        results[slug] = result
        time.sleep(0.5)

    print("\n=== Summary ===")
    ok = sum(1 for v in results.values() if v)
    print(f"  {ok}/{len(results)} brands got logos")
    for slug, path in results.items():
        status = "✓" if path else "✗"
        print(f"  {status} {slug:15s} → {path or 'FAILED'}")


if __name__ == "__main__":
    main()
