#!/usr/bin/env python3
"""
Assign 76 AI images ke semua 621 artikel berdasarkan topik.
Setiap artikel dapat AI image yang sesuai dengan topiknya.
"""
import json
import random
from pathlib import Path
from collections import defaultdict

random.seed(42)

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')
AI_DIR = Path('/home/z/my-project/public/article-images-ai')

# ============================================================
# Topic keywords (same as generators)
# ============================================================
PEREDAM_KEYWORDS = ['peredam', 'damping', 'soundproofing', 'peredaman', 'getar', 'kabin']
SPEAKER_KEYWORDS = ['speaker', 'tweeter', 'midrange', 'midbass', 'coaxial', 'component', 'polaritas', 'baffle']
AMP_KEYWORDS = ['amplifier', 'power', 'rms', 'gain', 'fuse', 'grounding', 'kelistrikan', 'kabel', 'clipping', 'distorsi', 'watt', 'daya']
SUB_KEYWORDS = ['subwoofer', 'bass', 'box', 'sealed', 'ported', 'enclosure']
DSP_KEYWORDS = ['dsp', 'tuning', 'crossover', 'equalization', 'eq ', 'time alignment', 'phase', 'processor']
PAKET_KEYWORDS = ['paket', 'anggaran', 'upgrade', 'biaya', 'budget']
INSTAL_KEYWORDS = ['instalasi', 'pemasangan', 'kabel', 'baffle', 'dudukan']


def detect_topic(title):
    t = title.lower()
    # Peredam hanya kalau judul TENTANG peredam, bukan sekadar mention
    if any(k in t for k in ['peredam suara', 'peredam mobil', 'peredam kabin', 'peredam pintu', 'peredam kap', 'peredam lantai', 'peredam firewall', 'peredam plafon', 'peredam wheel', 'peredam fender', 'soundproofing', 'damping material', 'butyl', 'absorber']):
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
    # Check content for stronger signals
    return 'general'


def main():
    # Get all AI images on disk
    ai_images = sorted(AI_DIR.glob('*.png'))
    print(f"AI images on disk: {len(ai_images)}")

    # Categorize AI images by topic based on their filename
    ai_by_topic = defaultdict(list)
    for img in ai_images:
        name = img.name.lower()
        if any(k in name for k in ['peredam', 'damping', 'soundproof']):
            ai_by_topic['peredam'].append(f'/article-images-ai/{img.name}')
        elif any(k in name for k in ['subwoofer', 'sub-', 'bass']):
            ai_by_topic['subwoofer'].append(f'/article-images-ai/{img.name}')
        elif any(k in name for k in ['speaker', 'tweeter', 'midbass', 'midrange', 'coaxial']):
            ai_by_topic['speaker'].append(f'/article-images-ai/{img.name}')
        elif any(k in name for k in ['amplifier', 'amp-', 'power', 'mono', 'gain']):
            ai_by_topic['amplifier'].append(f'/article-images-ai/{img.name}')
        elif any(k in name for k in ['dsp', 'tuning', 'crossover']):
            ai_by_topic['dsp'].append(f'/article-images-ai/{img.name}')
        elif any(k in name for k in ['paket', 'anggaran', 'upgrade', 'membandingkan']):
            ai_by_topic['paket'].append(f'/article-images-ai/{img.name}')
        elif any(k in name for k in ['instalasi', 'pemasangan', 'kabel']):
            ai_by_topic['instalasi'].append(f'/article-images-ai/{img.name}')
        else:
            ai_by_topic['general'].append(f'/article-images-ai/{img.name}')

    print("\nAI images by topic:")
    for topic, imgs in sorted(ai_by_topic.items()):
        print(f"  {topic}: {len(imgs)} images")

    # Also add paket-images as supplementary
    paket_dir = Path('/home/z/my-project/public/paket-images')
    if paket_dir.exists():
        for img in paket_dir.glob('*.png'):
            ai_by_topic['general'].append(f'/paket-images/{img.name}')
        print(f"  (+ paket-images added to general)")

    # Load articles
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    articles = data.get('articles', [])
    print(f"\nTotal articles: {len(articles)}")

    # Assign AI image to each article based on topic
    updated = 0
    topic_counts = defaultdict(int)

    # Collect all AI images into a flat list for fallback
    all_ai = []
    for imgs in ai_by_topic.values():
        all_ai.extend(imgs)
    random.shuffle(all_ai)

    # Use round-robin assignment per topic
    topic_idx = defaultdict(int)

    for a in articles:
        title = a.get('title', '')
        content = a.get('content', '')
        topic = detect_topic(title + ' ' + content)

        # Get AI images for this topic
        topic_images = ai_by_topic.get(topic, [])

        if topic_images:
            # Round-robin: pick image based on counter
            idx = topic_idx[topic] % len(topic_images)
            img_url = topic_images[idx]
            topic_idx[topic] += 1
        elif all_ai:
            # Fallback: pick from all AI images
            idx = topic_idx['fallback'] % len(all_ai)
            img_url = all_ai[idx]
            topic_idx['fallback'] += 1
        else:
            # No AI images at all — keep existing
            continue

        old_img = a.get('imageUrl', '')
        if old_img != img_url:
            a['imageUrl'] = img_url
            a['galleryImages'] = [img_url]
            updated += 1

        topic_counts[topic] += 1

    # Save
    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Updated {updated} articles with AI images (topic-based)")
    print(f"\nArticles by topic:")
    for topic, count in sorted(topic_counts.items(), key=lambda x: -x[1]):
        print(f"  {topic}: {count} articles")

    # Final stats
    with_ai = len([a for a in articles if a.get('imageUrl', '').startswith('/article-images-ai/')])
    with_paket = len([a for a in articles if a.get('imageUrl', '').startswith('/paket-images/')])
    with_other = len([a for a in articles if not a.get('imageUrl', '').startswith('/article-images-ai/') and not a.get('imageUrl', '').startswith('/paket-images/')])
    without = len([a for a in articles if not a.get('imageUrl')])

    print(f"\nFinal status:")
    print(f"  With AI image (/article-images-ai/): {with_ai}")
    print(f"  With paket image (/paket-images/):   {with_paket}")
    print(f"  With other image:                    {with_other}")
    print(f"  Without image:                       {without}")
    print(f"  Total:                               {len(articles)}")


if __name__ == '__main__':
    main()
