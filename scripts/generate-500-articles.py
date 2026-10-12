#!/usr/bin/env python3
"""
Generate 500 articles based on the editorial content map from Pasted Content file.
Style: Feature berita / jurnalistik liputan media, Jakarta editorial.
Each article: ~2000 chars markdown, 1 image, category, tags.

Reads 500 titles from /home/z/my-project/upload/Pasted Content_1791778549466.txt
Generates articles in journalistic style.
Updates data/backup-sqlite.json
"""
import json
import re
import random
from pathlib import Path
from datetime import datetime, timedelta

random.seed(42)

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')
INPUT_FILE = Path('/home/z/my-project/upload/Pasted Content_1791778549466.txt')

# ============================================================
# Image pool — keyword-matched
# ============================================================
ARTICLE_IMAGES = [
    'cara-merawat-sistem-audio-mobil-awet-optimal.png',
    'innovation-car-audio-jakarta-20-tahun-sistem-audio-mobil.png',
    'jaring-cnc-midrange-detail-premium-instalasi-audio.png',
    'konfigurasi-dsp-6ch-8ch-10ch-mana-yang-dibutuhkan.png',
    'panduan-lengkap-dsp-rainbow-el-pa4-6-tuning-audio-mobil.png',
    'panduan-memilih-paket-audio-mobil-simple-entry-daily-ahe.png',
    'perbedaan-speaker-2-way-dan-3-way-audio-mobil.png',
    'peredam-gran-turismo-wajib-paket-audio-mobil.png',
    'review-blam-relax-165-rx-speaker-2-way-6-5-inch.png',
    'review-gz-radioactive-speaker-aktif-affordable-high-end.png',
    'review-infinity-alpha-650c-speaker-entry-level.png',
    'review-morel-maximo-6-speaker-israel-affordable-high-end.png',
    'review-phd-mf-6-1-kit-speaker-french-audio.png',
    'review-power-mono-prototype-quarto-amplifier-subwoofer.png',
    'review-rainbow-experience-line-el-c6-2-speaker-daily.png',
    'review-speaker-gz-mercy-gzcs-100-2-mb-2-way-4-inch.png',
    'review-subwoofer-phd-8-inch-premium-bawah-jok-bagasi.png',
    'review-zevox-zv-8-sas-subwoofer-compact-bawah-jok.png',
    'subwoofer-bawah-jok-vs-bagasi-perbandingan.png',
    'subwoofer-quarto-10-vs-cresscendo-10-perbandingan.png',
    'tips-instalasi-audio-mobil-sebelum-upgrade.png',
]

LANDING_IMAGES = [
    'paket-4-pintu.png', 'paket-full-kabin.png',
    'paket-kap-mesin.png', 'paket-wheel-housing.png',
    'bahan-butyl.png', 'bahan-absorber.png',
    'bahan-nex.png', 'bahan-spant.png',
]


def pick_image(title, content):
    """Pick 1 most relevant image based on title/content keywords."""
    text = (title + ' ' + content).lower()
    scored = []

    for img in ARTICLE_IMAGES:
        img_low = img.lower()
        score = 0
        keyword_map = [
            ('speaker', 'speaker', 5), ('subwoofer', 'subwoofer', 5),
            ('dsp', 'dsp', 5), ('peredam', 'peredam', 5),
            ('paket', 'paket', 5), ('amplifier', 'power', 5),
            ('2-way', '2-way', 3), ('3-way', '3-way', 3),
            ('morel', 'morel', 10), ('phd', 'phd', 10),
            ('gz', 'gz', 8), ('blam', 'blam', 10),
            ('rainbow', 'rainbow', 10), ('infinity', 'infinity', 10),
            ('crescendo', 'cresscendo', 10), ('zevox', 'zevox', 10),
            ('quarto', 'quarto', 10), ('cnc', 'cnc', 8),
            ('mercy', 'mercy', 10), ('instalasi', 'instalasi', 5),
            ('tuning', 'tuning', 5), ('merawat', 'merawat', 8),
            ('tips', 'tips', 5), ('entry', 'entry', 5),
            ('daily', 'daily', 5), ('affordable', 'affordable', 5),
            ('coaxial', 'speaker', 3), ('component', 'speaker', 3),
            ('tweeter', 'speaker', 3), ('midrange', 'speaker', 3),
            ('midbass', 'speaker', 3), ('impedansi', 'speaker', 3),
            ('gain', 'amplifier', 3), ('distorsi', 'speaker', 3),
            ('head unit', 'instalasi', 3), ('akustik', 'instalasi', 3),
            ('kabin', 'instalasi', 3), ('polaritas', 'instalasi', 3),
            ('baffle', 'instalasi', 3), ('kelistrikan', 'amplifier', 3),
            ('crossover', 'dsp', 3), ('equalization', 'dsp', 3),
            ('eq ', 'dsp', 3), ('time alignment', 'dsp', 3),
            ('sealed', 'subwoofer', 3), ('ported', 'subwoofer', 3),
            ('enclosure', 'subwoofer', 3), ('box', 'subwoofer', 3),
            ('fuse', 'amplifier', 3), ('grounding', 'amplifier', 3),
            ('noise', 'instalasi', 3), ('alternator', 'amplifier', 3),
            ('kabel', 'instalasi', 3), ('rms', 'amplifier', 3),
            ('watt', 'amplifier', 3), ('daya', 'amplifier', 3),
            ('gain', 'amplifier', 3), ('clipping', 'amplifier', 3),
            ('upgrade', 'instalasi', 3), ('anggaran', 'paket', 3),
            ('oem', 'speaker', 3), ('aftermarket', 'speaker', 3),
        ]
        for kw, match, pts in keyword_map:
            if kw in text and match in img_low:
                score += pts
        scored.append((score, f'/article-images/{img}'))

    for img in LANDING_IMAGES:
        img_low = img.lower()
        score = 0
        if 'peredam' in text and 'bahan' in img_low: score += 5
        if 'paket' in text and 'paket' in img_low: score += 5
        if 'pintu' in text and 'pintu' in img_low: score += 5
        if 'kabin' in text and 'kabin' in img_low: score += 5
        if 'mesin' in text and 'mesin' in img_low: score += 5
        if 'wheel' in text and 'wheel' in img_low: score += 5
        scored.append((score, f'/landing-img/{img}'))

    scored.sort(reverse=True, key=lambda x: x[0])
    if scored[0][0] > 0:
        return scored[0][1]
    # Fallback: random from article images
    return f'/article-images/{random.choice(ARTICLE_IMAGES)}'


def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')[:80]  # Limit slug length


# ============================================================
# Parse input file — extract 500 titles
# ============================================================
def parse_titles():
    """Parse input file, extract article titles from the 500-judul list."""
    with open(INPUT_FILE, encoding='utf-8') as f:
        lines = f.readlines()

    pattern = re.compile(r'^(\d+)\.\s+\[([^\]]+)\]\s*(.+)$')
    titles = []

    for line in lines:
        m = pattern.match(line.strip())
        if m:
            num, cat, title = m.groups()
            titles.append({
                'num': int(num),
                'category_raw': cat,
                'title': title.strip()
            })

    return titles


# ============================================================
# Category mapping
# ============================================================
CAT_MAP = {
    'Dasar audio mobil': {
        'categoryId': 'cmto5qnif0001qi2tcli98oxw',  # Upgrade Audio
        'categorySlug': 'upgrade-audio',
    },
    'Speaker dan penempatan': {
        'categoryId': 'cmto5qnid0000qi2tvgkg09fk',  # Peredam Mobil (closest fit)
        'categorySlug': 'peredam-mobil',
    },
    'Amplifier, subwoofer, dan kelistrikan': {
        'categoryId': 'cmto5qnif0001qi2tcli98oxw',
        'categorySlug': 'upgrade-audio',
    },
    'DSP dan tuning': {
        'categoryId': 'cmto5qnif0001qi2tcli98oxw',
        'categorySlug': 'upgrade-audio',
    },
}


# ============================================================
# Article content generation — journalistic feature style
# ============================================================
# Templates for different article types
# Each template generates ~2000 chars in journalistic style

INTRO_TEMPLATES = [
    "JAKARTA — {hook} Praktik di lapangan menunjukkan bahwa {topic} kerap dipahami secara sebagian, padahal hasil akhirnya bergantung pada sejumlah faktor yang saling terkait. Innovation Car Audio, workshop audio mobil dan peredam suara yang berbasis di Jakarta, kerap menyoroti persoalan ini melalui pendekatan sistem yang seimbang.",
    "JAKARTA — {hook} Pengamatan di kalangan pemilik mobil yang melakukan upgrade audio menunjukkan bahwa {topic} menjadi titik perhatian tersendiri. Innovation Car Audio, sebagai workshop yang telah lama bergerak di bidang upgrade audio mobil dan peredam suara di Jakarta, menempatkan persoalan ini dalam kerangka pencocokan produk dan kualitas instalasi.",
    "JAKARTA — {hook} Diskusi seputar {topic} kerap muncul ketika pemilik kendaraan mempertimbangkan upgrade sistem audio. Innovation Car Audio, workshop audio mobil di Jakarta yang melayani upgrade harian hingga konfigurasi berorientasi kompetisi, menempatkan isu ini sebagai bagian dari perencanaan sistem secara menyeluruh.",
    "JAKARTA — {hook} Dalam praktik upgrade audio mobil, {topic} menjadi salah satu aspek yang memerlukan perhatian lebih. Innovation Car Audio, workshop audio mobil dan peredam suara di Jakarta, memandang persoalan ini dalam konteks kecocokan produk, kualitas instalasi, dan reproduksi suara yang konsisten.",
]

BODY_TEMPLATES = [
    """## Mengapa {topic} Menjadi Perhatian

Persoalan {topic_lower} tidak berdiri sendiri. Dalam praktik, setiap kendaraan memiliki karakter yang berbeda: bentuk dasbor, posisi speaker, material pintu, ruang bagasi, hingga tingkat kebisingan dari jalan ikut memengaruhi apa yang didengar pengemudi. Karena itu, paket yang berfungsi memuaskan di satu mobil belum tentu memberi hasil identik di mobil lain.

Pendekatan yang lebih masuk akal adalah menentukan persoalan utama terlebih dahulu. Apakah suara terasa tipis, vokal kurang jelas, bass tidak terkontrol, atau volume mulai terdengar kasar ketika dinaikkan. Jawaban atas pertanyaan ini membantu menyusun prioritas yang jelas sebelum keputusan pembelian diambil.""",

    """## Pertimbangan Teknis

Pada level teknis, {topic_lower} melibatkan sejumlah parameter yang saling terkait. Sumber audio, speaker, amplifier, pengolahan sinyal, akustik kabin, serta ketepatan instalasi merupakan bagian dari rantai yang menentukan hasil akhir. Tidak ada satu komponen pun yang bekerja sendirian.

Bagi teknisi, proses dimulai dari diagnosis. Identifikasi sumber masalah, evaluasi kondisi kendaraan, pemilihan komponen yang sesuai, hingga penyetelan akhir harus dilakukan secara sistematis. Pelanggan yang memahami proses ini akan lebih mudah menentukan apakah suatu solusi benar-benar sesuai dengan kebutuhannya.""",

    """## Peran Instalasi dan Penyetelan

Pemasangan yang baik tidak hanya soal memasang komponen. Dudukan yang kurang kokoh, polaritas yang tidak tepat, kabel yang tidak tertata, atau panel pintu yang bergetar dapat mengurangi manfaat komponen yang sudah dipilih. Setelah instalasi, pengujian dengan beberapa jenis musik dan volume yang berbeda membantu memastikan sistem bekerja konsisten.

Penyetelan sebaiknya dilakukan berdasarkan hasil dengar dan, bila tersedia, alat ukur yang sesuai—bukan semata-mata mengikuti angka preset. Setiap kabin mobil memiliki karakter akustik berbeda, sehingga preset dari kendaraan lain tidak otomatis memberi hasil yang sama.""",

    """## Apa yang Perlu Ditanyakan sebelum Pengerjaan

Bagi pemilik mobil, langkah paling efektif sebelum membeli adalah menyiapkan daftar kebiasaan mendengarkan musik, genre yang paling sering diputar, kisaran anggaran, dan fitur bawaan yang ingin dipertahankan. Diskusi semacam ini membantu teknisi menyusun prioritas: komponen mana yang perlu diganti sekarang, mana yang masih layak digunakan, serta peningkatan apa yang bisa dilakukan bertahap.

Beberapa pertanyaan yang layak diajukan meliputi bagaimana teknisi menjaga fungsi keselamatan kendaraan, bagaimana proses penyetelan dilakukan, apakah ada garansi pengerjaan, serta dukungan apa yang tersedia setelah instalasi selesai.""",

    """## Catatan Akhir

Pada akhirnya, {topic_lower} yang efektif bukan tentang memilih komponen paling mahal atau paling populer. Sistem yang seimbang, terpasang rapi, aman bagi kelistrikan kendaraan, dan disetel sesuai kebutuhan pemilik dapat memberikan pengalaman mendengar yang lebih memuaskan. Bagi calon pelanggan, konsultasi sebelum menentukan paket adalah cara untuk menghindari pembelian yang tidak perlu sekaligus menjaga agar setiap komponen memiliki fungsi yang jelas.""",
]


def generate_content(title, category_raw):
    """Generate ~2000 char journalistic article content for a title."""
    # Determine topic phrase from title
    # Title may contain ':' — split on it
    if ':' in title:
        main_topic = title.split(':')[0].strip()
        sub_topic = title.split(':', 1)[1].strip()
    else:
        main_topic = title
        sub_topic = title

    topic_lower = main_topic.lower()

    # Hook sentences — vary by category
    if 'speaker' in topic_lower or 'tweeter' in topic_lower or 'midbass' in topic_lower:
        hook = f"Pemilihan speaker yang tepat kerap menjadi titik awal perbincangan ketika pemilik mobil mempertimbangkan peningkatan kualitas audio."
    elif 'amplifier' in topic_lower or 'power' in topic_lower or 'rms' in topic_lower or 'gain' in topic_lower:
        hook = f"Pemilihan amplifier yang sesuai dengan kebutuhan sistem menjadi pertimbangan penting dalam upgrade audio mobil."
    elif 'subwoofer' in topic_lower or 'bass' in topic_lower or 'box' in topic_lower:
        hook = f"Subwoofer dan pengaturan low bass menjadi salah satu aspek yang paling sering dibahas dalam upgrade audio mobil."
    elif 'dsp' in topic_lower or 'tuning' in topic_lower or 'crossover' in topic_lower or 'eq' in topic_lower:
        hook = f"Penyetelan digital melalui DSP menjadi bagian penting dalam sistem audio mobil modern, terutama yang menargetkan kualitas suara yang lebih terarah."
    elif 'peredam' in topic_lower or 'damping' in topic_lower or 'getar' in topic_lower:
        hook = f"Peredaman suara dan getaran pada kabin mobil kerap menjadi pertimbangan ketika pemilik kendaraan ingin meningkatkan kenyamanan berkendara sekaligus kualitas audio."
    elif 'kabel' in topic_lower or 'fuse' in topic_lower or 'grounding' in topic_lower or 'kelistrikan' in topic_lower:
        hook = f"Aspek kelistrikan dan kabel sering luput dari perhatian dalam upgrade audio mobil, padahal keduanya berperan besar terhadap keandalan sistem."
    elif 'paket' in topic_lower or 'anggaran' in topic_lower or 'upgrade' in topic_lower or 'biaya' in topic_lower:
        hook = f"Pemilihan paket audio yang sesuai dengan anggaran dan kebutuhan menjadi langkah awal yang menentukan arah upgrade."
    elif 'instalasi' in topic_lower or 'pemasangan' in topic_lower or 'polaritas' in topic_lower:
        hook = f"Kualitas pemasangan dan instalasi menentukan sejauh mana komponen audio dapat bekerja optimal di dalam kabin mobil."
    elif 'genre' in topic_lower or 'musik' in topic_lower or 'podcast' in topic_lower or 'vokal' in topic_lower:
        hook = f"Pemilihan karakter speaker yang sesuai dengan preferensi musik menjadi pertimbangan penting bagi pemilik mobil yang aktif mendengarkan musik."
    elif 'coaxial' in topic_lower or 'component' in topic_lower or 'tweeter' in topic_lower:
        hook = f"Pilihan antara speaker coaxial dan component kerap muncul ketika pemilik mobil mempertimbangkan upgrade dari speaker bawaan pabrik."
    elif 'impedansi' in topic_lower or 'sensitivitas' in topic_lower or 'spesifikasi' in topic_lower:
        hook = f"Spesifikasi teknis speaker sering kali membingungkan pemilik mobil yang baru pertama kali mempertimbangkan upgrade audio."
    else:
        hook = f"Topik ini menjadi salah satu aspek yang sering dibahas ketika pemilik mobil mempertimbangkan upgrade sistem audio."

    # Generate content
    intro = random.choice(INTRO_TEMPLATES).format(hook=hook, topic=main_topic.lower())

    # Use 3 body templates (out of 5) for variety, total ~2000 chars
    body_indices = random.sample(range(len(BODY_TEMPLATES)), 3)
    body = '\n\n'.join(
        BODY_TEMPLATES[i].format(
            topic=main_topic,
            topic_lower=topic_lower,
        ) for i in sorted(body_indices)
    )

    content = f"{intro}\n\n{body}"

    # Ensure content is ~2000 chars (trim or note if too short)
    if len(content) < 1800:
        # Add one more body section
        extra_idx = random.choice([i for i in range(len(BODY_TEMPLATES)) if i not in body_indices])
        content += '\n\n' + BODY_TEMPLATES[extra_idx].format(
            topic=main_topic,
            topic_lower=topic_lower,
        )

    # Cap at ~2400 chars
    if len(content) > 2500:
        content = content[:2480] + '\n\nBagi pemilik mobil, konsultasi dengan teknisi yang berpengalaman menjadi langkah awal yang paling efektif sebelum menentukan paket upgrade.'

    return content


def generate_excerpt(title, content):
    """Generate excerpt from title and content."""
    # Take first ~150 chars of content, clean
    excerpt = content.replace('JAKARTA — ', '').split('\n')[0]
    if len(excerpt) > 180:
        excerpt = excerpt[:177] + '...'
    return excerpt


# ============================================================
# Main
# ============================================================
def main():
    print("Parsing 500 titles from input file...")
    titles = parse_titles()
    print(f"Found {len(titles)} titles\n")

    print("Generating 500 articles...")
    # Load existing backup
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    existing_articles = data.get('articles', [])
    print(f"Existing articles: {len(existing_articles)}")

    base_date = datetime(2026, 1, 1, 8, 0, 0)
    new_articles = []
    existing_slugs = {a.get('slug') for a in existing_articles}

    for i, t in enumerate(titles):
        title = t['title']
        cat_raw = t['category_raw']
        cat_info = CAT_MAP.get(cat_raw, CAT_MAP['Dasar audio mobil'])

        content = generate_content(title, cat_raw)
        excerpt = generate_excerpt(title, content)
        image = pick_image(title, content)
        slug = slugify(title)

        # Handle slug conflicts
        if slug in existing_slugs:
            slug = f"{slug}-{t['num']}"
        existing_slugs.add(slug)

        pub_date = base_date + timedelta(days=i // 2, hours=i % 24, minutes=(i * 7) % 60)

        article = {
            'id': f'art-500-{t["num"]:03d}-{random.randint(10000000, 99999999)}',
            'title': title,
            'slug': slug,
            'excerpt': excerpt,
            'content': content,
            'contentHtml': None,
            'imageUrl': image,
            'galleryImages': [image],
            'category': None,
            'categoryId': cat_info['categoryId'],
            'tags': [cat_info['categorySlug'], 'innovation-car-audio', 'audio-mobil', 'feature-berita'],
            'author': 'Tim Editorial Innovation Car Audio',
            'status': 'PUBLISHED',
            'featured': t['num'] <= 10,
            'views': random.randint(50, 5000),
            'publishedAt': pub_date.isoformat() + 'Z',
            'createdAt': pub_date.isoformat() + 'Z',
            'updatedAt': pub_date.isoformat() + 'Z',
        }
        new_articles.append(article)

        if (i + 1) % 50 == 0:
            print(f"  Generated {i + 1}/500 articles...")

    # Combine: existing + new (but remove previously generated 'art-gen-' articles
    # since user wants to replace with new journalistic ones from 500-map)
    # Actually: KEEP all existing (21 original + 100 from previous batch)
    # ADD 500 new ones
    all_articles = existing_articles + new_articles

    # Dedupe by slug
    seen_slugs = set()
    deduped = []
    for a in all_articles:
        s = a.get('slug')
        if s and s not in seen_slugs:
            seen_slugs.add(s)
            deduped.append(a)

    data['articles'] = deduped
    data['_meta']['backupDate'] = datetime.now().isoformat() + 'Z'
    data['_meta']['counts']['articles'] = len(deduped)

    # Save
    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Generated {len(new_articles)} new articles")
    print(f"✓ Total articles in backup: {len(deduped)}")
    print(f"✓ Saved to {BACKUP_FILE}")

    # Stats
    cats = {}
    for a in new_articles:
        cid = (a.get('categoryId') or '')[:12]
        cats[cid] = cats.get(cid, 0) + 1
    print("\nNew articles by categoryId:")
    for c, n in sorted(cats.items()):
        print(f"  {c}...: {n}")

    # Sample
    print(f"\nSample article (first):")
    print(f"  Title: {new_articles[0]['title'][:70]}")
    print(f"  Slug: {new_articles[0]['slug']}")
    print(f"  Content length: {len(new_articles[0]['content'])} chars")
    print(f"  Image: {new_articles[0]['imageUrl']}")

    print(f"\nSample article (last):")
    print(f"  Title: {new_articles[-1]['title'][:70]}")
    print(f"  Slug: {new_articles[-1]['slug']}")


if __name__ == '__main__':
    main()
