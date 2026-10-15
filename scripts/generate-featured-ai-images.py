#!/usr/bin/env python3
"""
Generate AI images untuk 50 artikel featured (paling populer / paling baru).
"""
import json
import re
import random
import subprocess
import time
from pathlib import Path

random.seed(42)

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')
OUTPUT_DIR = Path('/home/z/my-project/public/article-images-ai')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Topic keywords
PEREDAM_KEYWORDS = ['peredam', 'damping', 'soundproofing', 'peredaman', 'getar', 'kabin']
SPEAKER_KEYWORDS = ['speaker', 'tweeter', 'midrange', 'midbass', 'coaxial', 'component', 'polaritas', 'baffle']
AMP_KEYWORDS = ['amplifier', 'power', 'rms', 'gain', 'fuse', 'grounding', 'kelistrikan', 'kabel', 'clipping', 'distorsi', 'watt', 'daya']
SUB_KEYWORDS = ['subwoofer', 'bass', 'box', 'sealed', 'ported', 'enclosure']
DSP_KEYWORDS = ['dsp', 'tuning', 'crossover', 'equalization', 'eq ', 'time alignment', 'phase', 'processor']
PAKET_KEYWORDS = ['paket', 'anggaran', 'upgrade', 'biaya', 'budget']
INSTAL_KEYWORDS = ['instalasi', 'pemasangan', 'kabel', 'baffle', 'dudukan']

PROMPT_TEMPLATES = {
    'peredam': [
        "Professional photo of car door panel with sound deadening material installed, automotive workshop, dark premium background, gold accents, high quality, detailed",
        "Close-up photo of soundproofing material applied inside car door, butyl damping material, professional installation, dark studio lighting, premium automotive",
    ],
    'speaker': [
        "Professional photo of car audio speaker system installed in vehicle door panel, component speaker with tweeter, dark premium background, gold accents, high quality",
        "Close-up of premium car speaker driver, 6.5 inch midbass with copper voice coil, professional product photography, dark studio background",
    ],
    'amplifier': [
        "Professional photo of car audio amplifier, Class D mono block, power LED glowing, dark premium background, gold heat sink, high quality product photography",
        "Car audio amplifier installed in trunk, professional wiring, power capacitor, dark studio lighting, premium automotive photography",
    ],
    'subwoofer': [
        "Professional photo of car subwoofer, 10 inch bass driver in custom enclosure, trunk installation, dark premium background, gold accents",
        "Car audio subwoofer box, ported enclosure, 12 inch subwoofer driver, professional photography, dark studio background, dramatic lighting",
    ],
    'dsp': [
        "Professional photo of car audio DSP digital signal processor, control panel with LCD display, dark premium background, gold accents, high quality",
        "DSP tuning interface on tablet showing audio equalizer curves, car audio calibration, professional photography, dark studio background",
    ],
    'paket': [
        "Professional photo of complete car audio system package, speakers amplifier and subwoofer displayed together, dark premium background, gold accents",
        "Car audio upgrade package components laid out, speaker set amplifier and DSP, professional product photography, dark studio background",
    ],
    'instalasi': [
        "Professional photo of car audio installation, technician hands wiring amplifier, workshop environment, dark premium background",
        "Car audio wiring harness, professional cable management, installation tools, dark studio photography, premium automotive",
    ],
    'general': [
        "Professional photo of premium car audio system, high-end audio components in luxury vehicle interior, dark premium background, gold accents",
        "Car audio workshop with premium sound system, professional installation, dark studio lighting, elegant automotive photography",
    ],
}


def detect_topic(title):
    t = title.lower()
    if any(k in t for k in PEREDAM_KEYWORDS): return 'peredam'
    if any(k in t for k in SUB_KEYWORDS): return 'subwoofer'
    if any(k in t for k in SPEAKER_KEYWORDS): return 'speaker'
    if any(k in t for k in AMP_KEYWORDS): return 'amplifier'
    if any(k in t for k in DSP_KEYWORDS): return 'dsp'
    if any(k in t for k in PAKET_KEYWORDS): return 'paket'
    if any(k in t for k in INSTAL_KEYWORDS): return 'instalasi'
    return 'general'


def generate_prompt(title):
    topic = detect_topic(title)
    templates = PROMPT_TEMPLATES[topic]
    idx = hash(title) % len(templates)
    return templates[idx], topic


def generate_image(prompt, output_path, size='1344x768', retries=2):
    for attempt in range(retries + 1):
        try:
            result = subprocess.run(
                ['z-ai', 'image', '-p', prompt, '-o', str(output_path), '-s', size],
                capture_output=True, text=True, timeout=90
            )
            if result.returncode == 0 and output_path.exists():
                return True, output_path.stat().st_size
            else:
                if attempt < retries:
                    time.sleep(2)
                    continue
                return False, 'failed'
        except subprocess.TimeoutExpired:
            if attempt < retries:
                time.sleep(5)
                continue
            return False, 'timeout'
        except Exception as e:
            return False, str(e)
    return False, 'max retries'


def main():
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    articles = data.get('articles', [])
    
    # Sort by views descending, pick top 50 that don't have AI image
    sorted_articles = sorted(articles, key=lambda a: a.get('views', 0), reverse=True)
    
    featured = []
    for a in sorted_articles:
        if len(featured) >= 50:
            break
        if not a.get('imageUrl', '').startswith('/article-images-ai/'):
            featured.append(a)
    
    print(f"Found {len(featured)} featured articles to generate AI images for")
    print()
    
    success = 0
    fail = 0
    
    for i, article in enumerate(featured):
        slug = article.get('slug', f'article-{i}')
        title = article.get('title', '')
        image_path = OUTPUT_DIR / f'{slug}.png'
        
        # Skip if already exists
        if image_path.exists() and image_path.stat().st_size > 5000:
            success += 1
            continue
        
        prompt, topic = generate_prompt(title)
        
        print(f"[{i+1}/50] {title[:50]}...")
        print(f"  Topic: {topic}")
        
        ok, info = generate_image(prompt, image_path)
        
        if ok:
            image_url = f'/article-images-ai/{slug}.png'
            article['imageUrl'] = image_url
            article['galleryImages'] = [image_url]
            success += 1
            print(f"  ✓ Saved ({info} bytes)")
        else:
            fail += 1
            print(f"  ✗ Failed: {info}")
        
        # Save JSON every 5 images
        if (i + 1) % 5 == 0:
            with open(BACKUP_FILE, 'w') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  📁 JSON saved (checkpoint)")
        
        time.sleep(1)
    
    # Final save
    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n=== Summary ===")
    print(f"Success: {success}/50")
    print(f"Failed: {fail}")
    
    # Total AI images
    ai_images = list(OUTPUT_DIR.glob('*.png'))
    print(f"\nTotal AI images: {len(ai_images)}")


if __name__ == '__main__':
    main()
