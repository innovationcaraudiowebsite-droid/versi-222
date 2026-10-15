#!/usr/bin/env python3
"""
Assign image dari pool ke 505 artikel non-featured yang masih pakai fallback.
Setiap artikel dapat image berdasarkan keyword matching yang lebih akurat.
"""
import json
from pathlib import Path

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')

# ============================================================
# Image pool dengan keyword tags
# ============================================================
IMAGE_POOL = [
    # Speaker reviews
    {'src': '/article-images/review-blam-relax-165-rx-speaker-2-way-6-5-inch.png', 'keywords': ['speaker', 'blam', '2 way', '6.5', 'review']},
    {'src': '/article-images/review-phd-mf-6-1-kit-speaker-french-audio.png', 'keywords': ['speaker', 'phd', 'kit', 'french', 'review']},
    {'src': '/article-images/review-morel-maximo-6-speaker-israel-affordable-high-end.png', 'keywords': ['speaker', 'morel', 'maximo', 'israel', 'review']},
    {'src': '/article-images/review-infinity-alpha-650c-speaker-entry-level.png', 'keywords': ['speaker', 'infinity', 'alpha', 'entry', 'review']},
    {'src': '/article-images/review-rainbow-experience-line-el-c6-2-speaker-daily.png', 'keywords': ['speaker', 'rainbow', 'experience', 'daily', 'review']},
    {'src': '/article-images/review-gz-radioactive-speaker-aktif-affordable-high-end.png', 'keywords': ['speaker', 'gz', 'radioactive', 'aktif', 'review']},
    {'src': '/article-images/review-speaker-gz-mercy-gzcs-100-2-mb-2-way-4-inch.png', 'keywords': ['speaker', 'gz', 'mercy', '4 inch', 'cnc']},
    # Subwoofer
    {'src': '/article-images/review-subwoofer-phd-8-inch-premium-bawah-jok-bagasi.png', 'keywords': ['subwoofer', 'phd', '8 inch', 'bawah jok', 'bass']},
    {'src': '/article-images/review-zevox-zv-8-sas-subwoofer-compact-bawah-jok.png', 'keywords': ['subwoofer', 'zevox', '8 inch', 'bawah jok', 'compact']},
    {'src': '/article-images/review-power-mono-prototype-quarto-amplifier-subwoofer.png', 'keywords': ['amplifier', 'power', 'mono', 'quarto', 'subwoofer']},
    {'src': '/article-images/subwoofer-bawah-jok-vs-bagasi-perbandingan.png', 'keywords': ['subwoofer', 'bawah jok', 'bagasi', 'perbandingan', 'bass']},
    {'src': '/article-images/subwoofer-quarto-10-vs-cresscendo-10-perbandingan.png', 'keywords': ['subwoofer', 'quarto', 'cresscendo', '10 inch', 'perbandingan']},
    # DSP
    {'src': '/article-images/panduan-lengkap-dsp-rainbow-el-pa4-6-tuning-audio-mobil.png', 'keywords': ['dsp', 'rainbow', 'tuning', 'panduan', 'setting']},
    {'src': '/article-images/konfigurasi-dsp-6ch-8ch-10ch-mana-yang-dibutuhkan.png', 'keywords': ['dsp', 'konfigurasi', 'channel', '6ch', '8ch', '10ch']},
    # Peredam
    {'src': '/article-images/peredam-gran-turismo-wajib-paket-audio-mobil.png', 'keywords': ['peredam', 'gran turismo', 'wajib', 'paket']},
    {'src': '/landing-img/bahan-butyl.png', 'keywords': ['peredam', 'bahan', 'butyl', 'material', 'damping']},
    {'src': '/landing-img/bahan-absorber.png', 'keywords': ['peredam', 'bahan', 'absorber', 'foam', 'material']},
    {'src': '/landing-img/bahan-nex.png', 'keywords': ['peredam', 'bahan', 'nex', 'heat barrier', 'material']},
    {'src': '/landing-img/bahan-spant.png', 'keywords': ['peredam', 'bahan', 'spant', 'premium', 'material']},
    # Paket
    {'src': '/article-images/panduan-memilih-paket-audio-mobil-simple-entry-daily-ahe.png', 'keywords': ['paket', 'anggaran', 'upgrade', 'memilih', 'biaya', 'budget']},
    {'src': '/article-images/panduan-lengkap-dsp-rainbow-el-pa4-6-tuning-audio-mobil.png', 'keywords': ['dsp', 'rainbow', 'tuning', 'panduan']},
    # Tips
    {'src': '/article-images/tips-instalasi-audio-mobil-sebelum-upgrade.png', 'keywords': ['tips', 'instalasi', 'pemasangan', 'upgrade', 'sebelum', 'kabel', 'baffle']},
    {'src': '/article-images/cara-merawat-sistem-audio-mobil-awet-optimal.png', 'keywords': ['tips', 'merawat', 'perawatan', 'maintenance', 'awet']},
    # Workshop
    {'src': '/article-images/innovation-car-audio-jakarta-20-tahun-sistem-audio-mobil.png', 'keywords': ['innovation', 'jakarta', 'workshop', '20 tahun', 'sejarah', 'brand']},
    {'src': '/article-images/jaring-cnc-midrange-detail-premium-instalasi-audio.png', 'keywords': ['cnc', 'midrange', 'detail', 'premium', 'instalasi']},
    # Speaker comparison
    {'src': '/article-images/perbedaan-speaker-2-way-dan-3-way-audio-mobil.png', 'keywords': ['speaker', '2 way', '3 way', 'perbedaan', 'coaxial', 'component']},
    # Paket images
    {'src': '/paket-images/simple-upgrade.png', 'keywords': ['simple', 'upgrade', 'entry', 'basic']},
    {'src': '/paket-images/entry-level.png', 'keywords': ['entry', 'level', 'amplifier', 'dsp']},
    {'src': '/paket-images/daily-use.png', 'keywords': ['daily', 'use', 'speaker', 'subwoofer']},
    {'src': '/paket-images/affordable-high-end.png', 'keywords': ['affordable', 'high end', 'premium', 'audiophile']},
    # Gallery
    {'src': '/gallery/slide-1.png', 'keywords': ['workshop', 'instalasi', 'dokumentasi']},
    {'src': '/gallery/slide-2.png', 'keywords': ['workshop', 'instalasi', 'dokumentasi']},
    {'src': '/gallery/slide-3.png', 'keywords': ['workshop', 'instalasi', 'dokumentasi']},
    {'src': '/gallery/slide-4.png', 'keywords': ['workshop', 'instalasi', 'dokumentasi']},
]


def pick_best_image(title, content):
    """Pick the best matching image based on title + content keywords."""
    text = (title + ' ' + content).lower()
    best_score = 0
    best_img = None
    
    for img in IMAGE_POOL:
        score = 0
        for kw in img['keywords']:
            if kw in text:
                score += len(kw)  # Longer keyword = higher score
        
        if score > best_score:
            best_score = score
            best_img = img['src']
    
    # Fallback: if no match, use workshop image
    if not best_img:
        best_img = '/article-images/innovation-car-audio-jakarta-20-tahun-sistem-audio-mobil.png'
    
    return best_img


def main():
    with open(BACKUP_FILE) as f:
        data = json.load(f)
    
    articles = data.get('articles', [])
    updated = 0
    
    for a in articles:
        # Skip articles that already have AI image
        img = a.get('imageUrl', '')
        if img.startswith('/article-images-ai/'):
            continue
        
        # Pick best matching image
        new_img = pick_best_image(a.get('title', ''), a.get('content', ''))
        
        if new_img != img:
            a['imageUrl'] = new_img
            a['galleryImages'] = [new_img]
            updated += 1
    
    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f'✓ Updated {updated} articles with better image matching')
    
    # Stats
    with_ai = len([a for a in articles if a.get('imageUrl','').startswith('/article-images-ai/')])
    with_pool = len([a for a in articles if not a.get('imageUrl','').startswith('/article-images-ai/') and a.get('imageUrl')])
    without = len([a for a in articles if not a.get('imageUrl')])
    
    print(f'\nStatus setelah update:')
    print(f'  Dengan AI image: {with_ai}')
    print(f'  Dengan pool image (improved): {with_pool}')
    print(f'  Tanpa image: {without}')
    print(f'  Total: {len(articles)}')


if __name__ == '__main__':
    main()
