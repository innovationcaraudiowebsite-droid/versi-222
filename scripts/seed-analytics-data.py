#!/usr/bin/env python3
"""
Seed mock analytics tracking data:
- 1000 page views (article, variant, home, category mix)
- 50 variant clicks (carousel/sibling/related mix)
- 20 WA clicks

Random timestamps dalam 90 hari terakhir supaya dashboard langsung ada data.
"""

import json
import random
import uuid
from datetime import datetime, timedelta, timezone

BACKUP_PATH = 'data/backup-sqlite.json'

with open(BACKUP_PATH, 'r') as f:
    data = json.load(f)

# Get all variant slugs + IDs
variants = data.get('productVariants', [])
articles = data.get('articles', [])
categories = data.get('categories', [])

print(f"Found {len(variants)} variants, {len(articles)} articles, {len(categories)} categories")
print()

# Generate random timestamps dalam 90 hari terakhir
def random_date(days_back=90):
    now = datetime.now(timezone.utc)
    random_days = random.randint(0, days_back)
    random_hours = random.randint(0, 23)
    random_minutes = random.randint(0, 59)
    return now - timedelta(days=random_days, hours=random_hours, minutes=random_minutes)

# Random IPs (Indonesia)
def random_ip():
    return f"{random.randint(36, 103)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

# Random user agents
USER_AGENTS = [
    "Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; CPH2247) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
]

# ============================================================
# Generate page views (1000)
# ============================================================
print("=== Generating 1000 page views ===")

# Distribute: 40% variant, 30% article, 20% home, 10% category
page_views = []
for _ in range(1000):
    rand = random.random()
    if rand < 0.40:
        # Variant page
        v = random.choice(variants)
        page_type = 'variant'
        slug = v['slug']
    elif rand < 0.70:
        # Article page
        if not articles:
            continue
        a = random.choice(articles)
        page_type = 'article'
        slug = a['slug']
    elif rand < 0.90:
        # Home
        page_type = 'home'
        slug = None
    else:
        # Category
        if not categories:
            continue
        c = random.choice(categories)
        page_type = 'category'
        slug = c['slug']

    page_views.append({
        'id': f"pv-{uuid.uuid4().hex[:12]}",
        'pageType': page_type,
        'pageSlug': slug,
        'viewedAt': random_date().isoformat(),
        'userAgent': random.choice(USER_AGENTS),
        'ipAddress': random_ip(),
        'referrer': random.choice([
            'https://www.google.com/search?q=peredam+mobil+jakarta',
            'https://www.instagram.com/',
            'https://www.facebook.com/',
            'https://peredammobiljakarta.com/',
            None,
            None,
            None,
        ]),
    })

# ============================================================
# Generate variant clicks (50)
# ============================================================
print("=== Generating 50 variant clicks ===")

variant_clicks = []
for _ in range(50):
    v = random.choice(variants)
    variant_clicks.append({
        'id': f"vc-{uuid.uuid4().hex[:12]}",
        'variantId': v['id'],
        'source': random.choices(
            ['carousel', 'sibling', 'related', 'search'],
            weights=[60, 20, 15, 5],
            k=1,
        )[0],
        'clickedAt': random_date().isoformat(),
        'userAgent': random.choice(USER_AGENTS),
        'ipAddress': random_ip(),
    })

# ============================================================
# Generate WA clicks (20)
# ============================================================
print("=== Generating 20 WA clicks ===")

wa_clicks = []
for _ in range(20):
    v = random.choice(variants)
    wa_clicks.append({
        'id': f"wa-{uuid.uuid4().hex[:12]}",
        'variantId': v['id'],
        'clickedAt': random_date().isoformat(),
        'userAgent': random.choice(USER_AGENTS),
        'ipAddress': random_ip(),
    })

# ============================================================
# Save to backup JSON
# ============================================================
data['pageViews'] = page_views
data['variantClicks'] = variant_clicks
data['waClicks'] = wa_clicks

with open(BACKUP_PATH, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print()
print("=" * 60)
print("=== SUMMARY ===")
print("=" * 60)
print(f"  Page views:    {len(page_views)}")
print(f"  Variant clicks: {len(variant_clicks)}")
print(f"  WA clicks:     {len(wa_clicks)}")
print(f"  Backup file:   {BACKUP_PATH}")

# Print distribution
print()
print("=== Page view distribution ===")
from collections import Counter
type_counts = Counter(pv['pageType'] for pv in page_views)
for ptype, count in type_counts.most_common():
    print(f"  {ptype}: {count}")

print()
print("=== Variant click sources ===")
src_counts = Counter(vc['source'] for vc in variant_clicks)
for src, count in src_counts.most_common():
    print(f"  {src}: {count}")
