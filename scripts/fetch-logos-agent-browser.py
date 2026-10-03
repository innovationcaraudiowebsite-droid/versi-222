#!/usr/bin/env python3
"""
Use agent-browser to render JS-heavy brand websites and extract logo URLs.
Then download, optimize, and save.
"""
import os, sys, re, json, time, subprocess, urllib3
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

# Brands to retry (JS-rendered or different approach needed)
BRANDS_TO_RETRY = {
    "infinity":     {"urls": [
        "https://infinitykappa.com/",
        "https://www.infinity.com/",
        "https://www.jbl.com/infinity.html",
    ]},
    "rainbow":      {"urls": [
        "https://www.rainbow-audio.de/",
        "https://www.rainbow.de/",
        "https://rainbow-car-audio.de/",
    ]},
    "gz":           {"urls": [
        "https://www.ground-zero.de/",
        "https://groundzeroaudio.de/",
        "https://www.groundzeroaudio.de/",
    ]},
    "phd":          {"urls": [
        "https://www.phdaudio.com/",
        "https://phdaudio.com/",
    ]},
    "goldhorn":     {"urls": [
        "https://www.goldhorn.com.cn/",
        "https://goldhornau.com/",
    ]},
    "silent-coat":  {"urls": [
        "https://www.silentcoat.com/",
        "https://silentcoat.eu/",
        "https://www.silentcoat.eu/",
    ]},
    "recoil":       {"urls": [
        "https://www.recoilaudio.com/",
        "https://www.recoilcaraudio.com/",
    ]},
    "reverb":       {"urls": [
        "https://www.reverbaudio.com/",
        "https://www.reverb-audio.com/",
    ]},
    # Re-try the wrong ones
    "blam":         {"urls": [
        "https://www.blam-audio.com/",
    ]},
    "zevox":        {"urls": [
        "https://zevox.net/",
    ]},
    "gran-turismo": {"urls": [
        "https://gran-turismo.com/",  # This is the WRONG site (racing game)
        # Gran Turismo Audio brand might not have an obvious website
    ]},
    "dl-audio-lab": {"urls": [
        "https://www.dlaudiolab.com/",
    ]},
}


def agent_browser_eval_js(url, js_code, timeout=20):
    """Use agent-browser to navigate to URL and run JS to extract logo URLs."""
    try:
        # Open the URL
        result = subprocess.run(
            ["agent-browser", "open", url],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode != 0:
            return None, f"open failed: {result.stderr[:100]}"

        # Wait for page to load
        subprocess.run(
            ["agent-browser", "wait", "--load", "networkidle"],
            capture_output=True, text=True, timeout=15
        )
        time.sleep(2)

        # Run JS
        result = subprocess.run(
            ["agent-browser", "eval", js_code],
            capture_output=True, text=True, timeout=15
        )
        return result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return None, str(e)
    finally:
        try:
            subprocess.run(["agent-browser", "close"], capture_output=True, text=True, timeout=5)
        except Exception:
            pass


def extract_logo_from_rendered(url, slug):
    """Open URL with agent-browser, extract logo URL via JS."""
    js_code = """
    (() => {
        const candidates = [];
        // Find header/logo imgs
        const imgs = document.querySelectorAll('img');
        for (const img of imgs) {
            const src = img.src || img.dataset?.src || img.dataset?.lazySrc || '';
            const alt = (img.alt || '').toLowerCase();
            const cls = (img.className || '').toLowerCase();
            const srcLow = src.toLowerCase();
            let score = 0;
            if (srcLow.includes('logo')) score += 50;
            if (alt.includes('logo')) score += 30;
            if (cls.includes('logo')) score += 20;
            if (cls.includes('header') || srcLow.includes('header')) score += 10;
            if (srcLow.includes('favicon') || srcLow.includes('icon-')) score -= 50;
            const bad = ['twitter', 'facebook', 'instagram', 'youtube', 'linkedin',
                         'tiktok', 'wechat', 'whatsapp', 'paypal', 'visa', 'master',
                         'arrow', 'btn-', 'button', 'search', 'menu', 'cart',
                         'slider', 'banner', 'hero', 'background', 'pattern',
                         'logo-default', 'pwa-app'];
            for (const b of bad) if (srcLow.includes(b) || alt.includes(b)) score -= 100;
            // WIX default placeholder
            if (srcLow.includes('logo-default.png')) score -= 200;
            if (score > 0) candidates.push({src, alt, score, w: img.naturalWidth, h: img.naturalHeight});
        }
        // Also check for SVGs
        const svgs = document.querySelectorAll('svg');
        for (const svg of svgs) {
            const cls = (svg.className?.baseVal || '').toLowerCase();
            if (cls.includes('logo') || cls.includes('brand')) {
                candidates.push({src: 'SVG_INLINE', alt: cls, score: 60, w: 0, h: 0});
            }
        }
        // Check meta og:image
        const og = document.querySelector('meta[property="og:image"]');
        if (og) {
            candidates.push({src: og.content, alt: 'og:image', score: 15, w: 0, h: 0});
        }
        candidates.sort((a, b) => b.score - a.score);
        return JSON.stringify(candidates.slice(0, 8));
    })()
    """
    output, err = agent_browser_eval_js(url, js_code)
    if not output:
        return []
    try:
        # Parse the JSON from output (may have prefixes)
        # Find first '[' and last ']'
        start = output.find('[')
        end = output.rfind(']')
        if start < 0 or end < 0:
            return []
        json_str = output[start:end+1]
        return json.loads(json_str)
    except Exception as e:
        print(f"    JS parse failed: {e}")
        return []


def download_image(url, timeout=20):
    """Download image bytes from URL. If SVG, rasterize."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout, verify=False, allow_redirects=True)
        if r.status_code != 200 or not r.content:
            return None
        if url.lower().endswith(".svg") or b"<svg" in r.content[:200].lower():
            try:
                png_bytes = cairosvg.svg2png(
                    bytestring=r.content,
                    output_width=800,
                    output_height=400,
                )
                return png_bytes
            except Exception as e:
                print(f"    SVG rasterize failed: {e}")
                return None
        return r.content
    except Exception as e:
        print(f"    Download failed: {e}")
        return None


def optimize_to_png(img_bytes, target_size=(400, 200)):
    """Convert raw image to optimized RGBA PNG, 400x200 canvas."""
    try:
        img = Image.open(BytesIO(img_bytes))
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

    # Resize to fit 400x200
    w, h = img.size
    tw, th = target_size
    if w / h > tw / th:
        new_w = tw
        new_h = max(1, int(tw * h / w))
    else:
        new_h = th
        new_w = max(1, int(th * w / h))
    img = img.resize((new_w, new_h), Image.LANCZOS)

    # Center on 400x200 transparent canvas
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    canvas.paste(img, ((tw - new_w) // 2, (th - new_h) // 2), img)

    return canvas


def save_optimized(img_rgba, path, target_kb=5):
    """Save PNG with palette mode for small size."""
    candidates = []
    buf = BytesIO()
    img_rgba.save(buf, format="PNG", optimize=True)
    candidates.append(("RGBA", buf.getvalue()))

    for colors in [32, 16, 8]:
        try:
            img_p = img_rgba.quantize(colors=colors, method=Image.FASTOCTREE)
            buf2 = BytesIO()
            img_p.save(buf2, format="PNG", optimize=True)
            candidates.append((f"P{colors}", buf2.getvalue()))
        except Exception:
            pass

    # Pick smallest, but prefer at least 1.5KB (better quality)
    best = min(candidates, key=lambda x: len(x[1]))
    Path(path).write_bytes(best[1])
    return best[0], len(best[1])


def process_brand(slug, brand_info):
    """Process one brand: try each URL, render with agent-browser, extract logo."""
    print(f"\n=== {slug} ===")
    for url in brand_info["urls"]:
        print(f"  Trying: {url}")
        candidates = extract_logo_from_rendered(url, slug)
        if not candidates:
            print(f"    No candidates")
            continue
        print(f"    Found {len(candidates)} candidates")
        for c in candidates[:5]:
            print(f"      score={c.get('score','?')} {c.get('w','?')}x{c.get('h','?')} "
                  f"alt='{str(c.get('alt',''))[:30]}' src={str(c.get('src',''))[:80]}")

        # Try downloading each candidate
        for c in candidates:
            src = c.get("src", "")
            if not src or src == "SVG_INLINE":
                continue
            # Make absolute URL
            if src.startswith("//"):
                src = "https:" + src
            elif src.startswith("/"):
                src = url.rstrip("/") + src

            img_bytes = download_image(src)
            if not img_bytes:
                continue
            print(f"    Downloaded: {len(img_bytes)} bytes from {src[:80]}")

            # Validate
            try:
                test = Image.open(BytesIO(img_bytes))
                test.load()
                print(f"    Valid: {test.format} {test.size} mode={test.mode}")
                # Skip if too small (probably favicon/icon)
                if test.size[0] < 60 or test.size[1] < 30:
                    print(f"    Too small, skip")
                    continue
            except Exception as e:
                print(f"    Invalid image: {e}")
                continue

            canvas = optimize_to_png(img_bytes)
            if canvas is None:
                continue

            out_path = OUT_DIR / f"{slug}.png"
            mode, size = save_optimized(canvas, out_path, target_kb=5)
            print(f"  ✓ SAVED {out_path} ({mode}, {size} bytes)")
            return out_path

    return None


def main():
    # Only process brands we want to retry
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(BRANDS_TO_RETRY.keys())
    print(f"Processing {len(targets)} brands: {', '.join(targets)}")
    results = {}
    for slug in targets:
        if slug not in BRANDS_TO_RETRY:
            print(f"Unknown brand: {slug}")
            continue
        result = process_brand(slug, BRANDS_TO_RETRY[slug])
        results[slug] = result
        time.sleep(1)

    print("\n=== Summary ===")
    ok = sum(1 for v in results.values() if v)
    print(f"  {ok}/{len(results)} brands updated")
    for slug, path in results.items():
        status = "✓" if path else "✗"
        print(f"  {status} {slug:15s} → {path or 'FAILED'}")


if __name__ == "__main__":
    main()
