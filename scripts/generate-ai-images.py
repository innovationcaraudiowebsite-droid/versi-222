#!/usr/bin/env python3
"""
Generate AI images for articles using z-ai-web-dev-sdk CLI.

Features:
- Topic-based prompt generator (speaker, amplifier, subwoofer, DSP, peredam, etc.)
- Resumable: skip articles that already have AI images
- Progress report every 5 images
- Saves to public/article-images-ai/{slug}.png
- Updates data/backup-sqlite.json incrementally

Usage:
  python3 scripts/generate-ai-images.py [--batch N] [--start N]

Options:
  --batch N    Process N articles then exit (default: 15 per run)
  --start N    Start from article index N (default: 0)
"""
import json
import re
import os
import sys
import subprocess
import time
from pathlib import Path

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')
OUTPUT_DIR = Path('/home/z/my-project/public/article-images-ai')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# Topic detection (same keywords as article generator)
# ============================================================
PEREDAM_KEYWORDS = ['peredam', 'damping', 'soundproofing', 'peredaman', 'getar', 'kabin']
SPEAKER_KEYWORDS = ['speaker', 'tweeter', 'midrange', 'midbass', 'coaxial', 'component', 'polaritas', 'baffle']
AMP_KEYWORDS = ['amplifier', 'power', 'rms', 'gain', 'fuse', 'grounding', 'kelistrikan', 'kabel', 'clipping', 'distorsi', 'watt', 'daya']
SUB_KEYWORDS = ['subwoofer', 'bass', 'box', 'sealed', 'ported', 'enclosure']
DSP_KEYWORDS = ['dsp', 'tuning', 'crossover', 'equalization', 'eq ', 'time alignment', 'phase', 'processor']
PAKET_KEYWORDS = ['paket', 'anggaran', 'upgrade', 'biaya', 'budget']
INSTAL_KEYWORDS = ['instalasi', 'pemasangan', 'kabel', 'baffle', 'dudukan']


def detect_topic(title):
    """Detect article topic from title keywords."""
    t = title.lower()
    if any(k in t for k in PEREDAM_KEYWORDS):
        return 'peredam'
    if any(k in t for k in SUB_KEYWORDS):
        return 'subwoofer'
    if any(k in t for k in SPEAKER_KEYWORDS):
        return 'speaker'
    if any(k in t for k in AMP_KEYWORDS):
        return 'amplifier'
    if any(k in t for k in DSP_KEYWORDS):
        return 'dsp'
    if any(k in t for k in PAKET_KEYWORDS):
        return 'paket'
    if any(k in t for k in INSTAL_KEYWORDS):
        return 'instalasi'
    return 'general'


# ============================================================
# Prompt templates per topic
# Style: professional automotive photography, dark premium, gold/red accents
# ============================================================
PROMPT_TEMPLATES = {
    'peredam': [
        "Professional photo of car door panel with sound deadening material installed, automotive workshop, dark premium background, gold accents, high quality, detailed",
        "Close-up photo of soundproofing material applied inside car door, butyl damping material, professional installation, dark studio lighting, premium automotive",
        "Car interior with acoustic damping foam and butyl material, sound deadening treatment, professional photography, dark elegant background",
    ],
    'speaker': [
        "Professional photo of car audio speaker system installed in vehicle door panel, component speaker with tweeter, dark premium background, gold accents, high quality",
        "Close-up of premium car speaker driver, 6.5 inch midbass with copper voice coil, professional product photography, dark studio background",
        "Car audio component speaker set, tweeter and midbass driver, professional installation in vehicle door, dark elegant lighting",
    ],
    'amplifier': [
        "Professional photo of car audio amplifier, Class D mono block, power LED glowing, dark premium background, gold heat sink, high quality product photography",
        "Car audio amplifier installed in trunk, professional wiring, power capacitor, dark studio lighting, premium automotive photography",
        "Close-up of car amplifier, brushed aluminum finish, power terminals, professional product shot, dark background with gold accents",
    ],
    'subwoofer': [
        "Professional photo of car subwoofer, 10 inch bass driver in custom enclosure, trunk installation, dark premium background, gold accents",
        "Car audio subwoofer box, ported enclosure, 12 inch subwoofer driver, professional photography, dark studio background, dramatic lighting",
        "Subwoofer installed in car trunk, custom fiberglass enclosure, bass driver close-up, dark elegant automotive photography",
    ],
    'dsp': [
        "Professional photo of car audio DSP digital signal processor, control panel with LCD display, dark premium background, gold accents, high quality",
        "DSP tuning interface on tablet showing audio equalizer curves, car audio calibration, professional photography, dark studio background",
        "Car audio processor unit, digital signal processor with RCA connections, professional product photography, dark elegant lighting",
    ],
    'paket': [
        "Professional photo of complete car audio system package, speakers amplifier and subwoofer displayed together, dark premium background, gold accents",
        "Car audio upgrade package components laid out, speaker set amplifier and DSP, professional product photography, dark studio background",
        "Complete car audio system installation in vehicle, premium upgrade package, dark elegant automotive photography",
    ],
    'instalasi': [
        "Professional photo of car audio installation, technician hands wiring amplifier, workshop environment, dark premium background",
        "Car audio wiring harness, professional cable management, installation tools, dark studio photography, premium automotive",
        "Workshop installation of car speaker, professional technician working on door panel, dark elegant background, detailed",
    ],
    'general': [
        "Professional photo of premium car audio system, high-end audio components in luxury vehicle interior, dark premium background, gold accents",
        "Car audio workshop with premium sound system, professional installation, dark studio lighting, elegant automotive photography",
        "Luxury car interior with premium audio system, dashboard speakers and controls, dark professional photography, gold details",
    ],
}


def generate_prompt(title):
    """Generate image prompt based on article title."""
    topic = detect_topic(title)
    templates = PROMPT_TEMPLATES[topic]
    # Use deterministic selection based on title hash for consistency
    idx = hash(title) % len(templates)
    return templates[idx], topic


# ============================================================
# AI image generation via z-ai CLI
# ============================================================
def generate_image(prompt, output_path, size='1344x768', retries=2):
    """Generate image using z-ai CLI."""
    for attempt in range(retries + 1):
        try:
            result = subprocess.run(
                ['z-ai', 'image', '-p', prompt, '-o', str(output_path), '-s', size],
                capture_output=True, text=True, timeout=90
            )
            if result.returncode == 0 and output_path.exists():
                return True, output_path.stat().st_size
            else:
                stderr = result.stderr[:200] if result.stderr else 'unknown'
                if attempt < retries:
                    time.sleep(2)
                    continue
                return False, stderr
        except subprocess.TimeoutExpired:
            if attempt < retries:
                time.sleep(5)
                continue
            return False, 'timeout'
        except Exception as e:
            if attempt < retries:
                time.sleep(2)
                continue
            return False, str(e)
    return False, 'max retries'


# ============================================================
# Main
# ============================================================
def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--batch', type=int, default=15, help='Articles per run')
    parser.add_argument('--start', type=int, default=0, help='Start index')
    args = parser.parse_args()

    # Load backup
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    articles = data.get('articles', [])
    # Filter: only art-500-* articles (generated ones)
    gen_articles = [a for a in articles if a.get('id', '').startswith('art-500-')]
    print(f"Total generated articles: {len(gen_articles)}")
    print(f"Batch size: {args.batch}")
    print(f"Start index: {args.start}")
    print()

    # Process articles
    success_count = 0
    fail_count = 0
    skip_count = 0
    processed = 0

    for i, article in enumerate(gen_articles[args.start:], start=args.start):
        if processed >= args.batch:
            print(f"\n=== Batch limit reached ({args.batch}). Run again with --start {i} ===")
            break

        slug = article.get('slug', f'article-{i}')
        title = article.get('title', '')
        image_path = OUTPUT_DIR / f'{slug}.png'
        image_url = f'/article-images-ai/{slug}.png'

        # Skip if already has AI image
        if image_path.exists() and image_path.stat().st_size > 5000:
            # Already generated, just update JSON if needed
            if article.get('imageUrl') != image_url:
                article['imageUrl'] = image_url
                article['galleryImages'] = [image_url]
            skip_count += 1
            processed += 1
            continue

        # Generate prompt
        prompt, topic = generate_prompt(title)

        # Generate image
        print(f"[{i+1}/{len(gen_articles)}] Generating: {title[:50]}...")
        print(f"  Topic: {topic}")
        print(f"  Prompt: {prompt[:80]}...")

        ok, info = generate_image(prompt, image_path)

        if ok:
            # Update article
            article['imageUrl'] = image_url
            article['galleryImages'] = [image_url]
            success_count += 1
            print(f"  ✓ Saved: {image_path.name} ({info} bytes)")
        else:
            fail_count += 1
            print(f"  ✗ Failed: {info}")

        processed += 1

        # Save JSON every 5 images (incremental)
        if (processed % 5) == 0:
            with open(BACKUP_FILE, 'w') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  📁 JSON saved (checkpoint)")

        # Small delay between requests
        time.sleep(1)

    # Final save
    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n=== Summary ===")
    print(f"Processed: {processed}")
    print(f"Success:   {success_count}")
    print(f"Skipped:   {skip_count} (already had AI image)")
    print(f"Failed:    {fail_count}")
    print(f"Next start: --start {args.start + processed - skip_count}")

    # Count total AI images generated
    ai_images = list(OUTPUT_DIR.glob('*.png'))
    total_size = sum(f.stat().st_size for f in ai_images)
    print(f"\nTotal AI images in {OUTPUT_DIR}: {len(ai_images)}")
    print(f"Total size: {total_size / 1024 / 1024:.1f} MB")


if __name__ == '__main__':
    main()
