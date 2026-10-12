#!/usr/bin/env python3
"""
Generate 500 articles with journalistic feature style + narasumber quotes.

Format (per user spec):
- Narasumber: Ko Lukito Tjandra
- 2 kutipan per artikel
- Keyword per kategori:
  * Speaker/Amplifier/DSP → "audio car"
  * Peredam → "peredam"
- Author: Innovation Car Audio
- Replace 500 existing generated articles (keep 121 original)
- Slug changes OK (judul baru)

Style (matching user's example article):
- JAKARTA — {hook} dateline opener
- Mention Innovation Car Audio + narasumber
- 2 kutipan narasumber dengan **"..."**, jelasnya/tambahnya
- 2-3 sub-headings (### )
- SEO: keyword di judul, excerpt, content body 3-5x, tags
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
# Image pool
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
    text = (title + ' ' + content).lower()
    scored = []
    for img in ARTICLE_IMAGES:
        img_low = img.lower()
        score = 0
        kw_map = [
            ('speaker', 'speaker', 5), ('subwoofer', 'subwoofer', 5),
            ('dsp', 'dsp', 5), ('peredam', 'peredam', 5),
            ('paket', 'paket', 5), ('amplifier', 'power', 5),
            ('tweeter', 'speaker', 3), ('midbass', 'speaker', 3),
            ('midrange', 'speaker', 3), ('coaxial', 'speaker', 3),
            ('component', 'speaker', 3), ('impedansi', 'speaker', 3),
            ('sensitivitas', 'speaker', 3), ('spesifikasi', 'speaker', 3),
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
            ('clipping', 'amplifier', 3), ('upgrade', 'instalasi', 3),
            ('anggaran', 'paket', 3), ('oem', 'speaker', 3),
        ]
        for kw, match, pts in kw_map:
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
    return f'/article-images/{random.choice(ARTICLE_IMAGES)}'


def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')[:90]


# ============================================================
# Parse input file — extract 500 titles
# ============================================================
def parse_titles():
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
# Category → Keyword + categoryId mapping
# ============================================================
CAT_CONFIG = {
    'Dasar audio mobil': {
        'categoryId': 'cmto5qnif0001qi2tcli98oxw',  # Upgrade Audio
        'categorySlug': 'upgrade-audio',
        'keyword': 'audio car',
        'keyword_alt': 'audio mobil',
    },
    'Speaker dan penempatan': {
        'categoryId': 'cmto5qnid0000qi2tvgkg09fk',  # Peredam Mobil
        'categorySlug': 'peredam-mobil',
        'keyword': 'audio car',
        'keyword_alt': 'speaker mobil',
    },
    'Amplifier, subwoofer, dan kelistrikan': {
        'categoryId': 'cmto5qnif0001qi2tcli98oxw',
        'categorySlug': 'upgrade-audio',
        'keyword': 'audio car',
        'keyword_alt': 'sistem audio mobil',
    },
    'DSP dan tuning': {
        'categoryId': 'cmto5qnif0001qi2tcli98oxw',
        'categorySlug': 'upgrade-audio',
        'keyword': 'audio car',
        'keyword_alt': 'tuning audio mobil',
    },
}

# Override: articles that are about peredam → keyword "peredam"
PEREDAM_KEYWORDS = ['peredam', 'damping', 'soundproofing', 'peredaman', 'getar', 'kabin']
SPEAKER_KEYWORDS = ['speaker', 'tweeter', 'midrange', 'midbass', 'coaxial', 'component', 'polaritas', 'baffle']
AMP_KEYWORDS = ['amplifier', 'power', 'rms', 'gain', 'fuse', 'grounding', 'kelistrikan', 'kabel', 'clipping', 'distorsi', 'watt', 'daya']
SUB_KEYWORDS = ['subwoofer', 'bass', 'box', 'sealed', 'ported', 'enclosure']
DSP_KEYWORDS = ['dsp', 'tuning', 'crossover', 'equalization', 'eq ', 'time alignment', 'phase', 'processor']


def get_keyword_for_title(title, cat_raw):
    """Determine primary keyword based on title content."""
    t = title.lower()
    # Check peredam first (highest priority for "peredam" keyword)
    if any(k in t for k in PEREDAM_KEYWORDS):
        return 'peredam', 'peredam suara mobil', 'peredam-mobil', 'cmto5qnid0000qi2tvgkg09fk'
    # Default from category
    cfg = CAT_CONFIG.get(cat_raw, CAT_CONFIG['Dasar audio mobil'])
    return cfg['keyword'], cfg['keyword_alt'], cfg['categorySlug'], cfg['categoryId']


# ============================================================
# Pool 60+ kutipan narasumber Ko Lukito Tjandra
# Dikategorikan per topik untuk relevansi
# ============================================================
QUOTES = {
    'speaker': [
        "Speaker yang baik tetap perlu tuning yang tepat agar karakteristiknya keluar optimal di kabin mobil. Banyak pelanggan terkejut setelah tuning ulang, suara speaker murah pun bisa terdengar jauh lebih baik.",
        "Pemilihan speaker tidak bisa dilepaskan dari genre musik favorit pemilik mobil. Speaker yang cocok untuk musik jazz belum tentu cocok untuk musik EDM atau dangdut.",
        "Pemasangan speaker yang tidak kokoh akan menyebabkan getaran panel yang merusak kualitas suara. Ini sering luput dari perhatian, padahal dampaknya signifikan.",
        "Polaritas speaker yang terbalik bisa membuat bass hilang dan panggung suara runtuh. Ini kesalahan instalasi paling umum yang sering kami temui.",
        "Speaker bawaan pabrik sebenarnya tidak selalu jelek. Yang jelek sering kali adalah pemasangannya — tanpa peredam, tanpa baffle yang benar, sehingga suara tidak optimal.",
        "Break-in speaker itu nyata, tapi jangan berlebihan. Speaker butuh waktu beberapa jam pemakaian untuk karakternya stabil, bukan berhari-hari seperti mitos yang beredar.",
        "Midbass yang baik bukan yang paling keras, tapi yang paling terkontrol. Banyak orang salah persepsi, mengira midbass yang boomy itu bagus, padahal itu tanda speaker overdriven.",
    ],
    'amplifier': [
        "Amplifier bukan tentang watt terbesar, tapi tentang matching dengan speaker. Amplifier 50 watt RMS yang tepat bisa mengalahkan amplifier 200 watt yang tidak matching.",
        "Gain bukan volume. Gain yang disetel terlalu tinggi adalah penyebab utama distorsi dan kerusakan speaker. Banyak installer muda yang masih salah di sini.",
        "Grounding yang buruk adalah sumber noise paling umum di sistem audio mobil. Sebelum ganti amplifier, cek dulu kabel ground-nya, itu sering kali akar masalahnya.",
        "Kelistrikan mobil harus dipikirkan dari awal. Tambahan amplifier berdaya besar butuh kabel power yang sesuai dan fuse yang tepat. Ini soal keselamatan, bukan sekadar suara.",
        "Clipping itu musuh utama speaker. Banyak orang menyalahkan speaker pecah karena kualitas, padahal sebenarnya amplifier clipping yang merusaknya.",
        "Amplifier Class D sekarang sudah sangat baik. Mitos bahwa Class AB selalu lebih bagus itu sudah tidak sepenuhnya benar untuk pemakaian daily.",
        "Noise alternator sering muncul karena grounding amplifier dan head unit tidak konsisten. Satu titik ground yang benar bisa menyelesaikan banyak masalah.",
    ],
    'subwoofer': [
        "Subwoofer bukan soal ukuran terbesar, tapi soal matching dengan kabin dan enclosure yang tepat. Sub 8 inch yang benar setting-nya bisa kalahkan sub 12 inch yang asal pasang.",
        "Box subwoofer menentukan 50 persen karakter bass. Subwoofer yang sama bisa terdengar berbeda di sealed box vs ported box. Ini bukan detail kecil.",
        "Volume box subwoofer harus dihitung berdasarkan spesifikasi driver. Asal potong kayu sesuai ukuran bagasi akan menghasilkan bass yang tidak terkontrol.",
        "Subwoofer bawah jok itu solusi cerdas untuk yang tidak mau hilang ruang bagasi. Tapi harus pilih subwoofer compact yang dirancang untuk instalasi underseat.",
        "Bass yang baik itu terasa, bukan terdengar. Kalau Anda masih 'mendengar' bass sebagai bunyi terpisah, berarti integrasi subwoofer dengan speaker belum benar.",
        "Power mono untuk subwoofer itu investasi yang tepat. Amplifier 4 channel yang dipakai untuk speaker dan sub sering tidak optimal untuk keduanya.",
        "Subwoofer 10 inch adalah sweet spot untuk daily use. Cukup dalam untuk bass, tidak terlalu boros ruang, dan mudah di-drive oleh amplifier moderate.",
    ],
    'dsp': [
        "DSP bukan alat ajaib. Tanpa instalasi yang benar, DSP tidak akan menyelesaikan masalah. Banyak orang beli DSP mahal tapi hasilnya mengecewakan karena instalasinya amburadul.",
        "Time alignment adalah fitur DSP yang paling sering diabaikan, padahal dampaknya paling besar. Bayangkan semua speaker sampai ke telinga Anda pada waktu yang sama — itu panggung suara yang benar.",
        "Equalizer bukan untuk membuat suara 'bagus'. EQ untuk koreksi masalah akustik kabin, bukan untuk menutupi kelemahan instalasi. Banyak orang salah pakai EQ.",
        "Crossover slope harus dipilih berdasarkan kemampuan speaker dan karakter kabin. Slope 12 dB berbeda hasilnya dengan 24 dB, ini bukan angka yang bisa diacak-acak.",
        "Preset dari mobil lain jangan disalin mentah-mentah. Setiap kabin punya karakter akustik berbeda, preset yang bagus di Avanza belum tentu bagus di Brio.",
        "DSP tuning itu proses, bukan sekali setting langsung jadi. Butuh test dengar berbagai genre, evaluasi, adjust, test lagi. Tidak ada shortcut untuk hasil yang benar.",
        "Banyak fitur DSP tidak menjamin kualitas. Yang penting adalah teknisi memahami apa yang dia setel, bukan sekadar mengikuti angka dari tutorial online.",
    ],
    'peredam': [
        "Peredam bukan sekadar menambah material. Diagnosis sumber kebisingan adalah kunci. Bukan berarti seluruh mobil harus dilapisi, itu justru menambah berat dan biaya tanpa hasil optimal.",
        "Peredam pintu itu investasi paling cost-effective untuk audio mobil. Begitu pintu diperedam dengan benar, speaker bawaan pun langsung terdengar lebih baik.",
        "Material peredam yang berbeda fungsi. Butyl untuk mass loading, absorber untuk menyerap suara, Nex untuk heat barrier. Tidak bisa pakai satu material untuk semua masalah.",
        "Peredam yang dipasang sembarangan bisa mengganggu mekanisme jendela, airbag samping, atau jalur pembuangan air. Pemasangan harus mengikuti prosedur yang benar.",
        "Peredam kap mesin itu dua manfaat: kurangi panas dan kurangi noise mesin. Bagi yang sering macet di Jakarta, ini investasi kenyamanan yang sangat worth it.",
        "Banyak orang kaget setelah peredam penuh, mobil terasa seperti kabin pesawat. Tapi ingat, peredam juga menambah berat, jadi hitung budget bensin juga.",
        "Peredam wheel housing paling berdampak untuk reduksi noise jalan. Tapi aksesnya paling sulit, jadi harus dikerjakan teknisi yang berpengalaman.",
    ],
    'paket': [
        "Paket audio bukan soal harga termurah atau termahal. Yang penting adalah komponen di dalamnya saling melengkapi sebagai satu sistem, bukan kumpulan barang mahal yang tidak matching.",
        "Upgrade bertahap itu strategi yang cerdas. Tapi harus direncanakan dari awal, jangan beli speaker sekarang lalu ganti lagi tahun depan karena tidak cocok dengan amplifier yang dibeli kemudian.",
        "Anggaran audio mobil harus termasuk biaya instalasi, peredam, kabel, dan tuning. Banyak orang hanya hitung harga komponen, lalu kaget saat totalnya membengkak.",
        "Paket yang bagus untuk daily use berbeda dengan paket competition. Jangan paksa paket competition kalau daily use yang dibutuhkan — itu buang uang.",
        "Konsultasi sebelum beli itu penting. Teknisi yang baik akan bertanya kebiasaan mendengarkan Anda, bukan langsung menawarkan paket paling mahal.",
        "Garansi pengerjaan itu tanda workshop yang serius. Workshop yang tidak berani memberi garansi, biasanya tidak yakin dengan kualitas instalasinya sendiri.",
        "Test dengar sebelum commit. Workshop profesional pasti punya demo room atau demo car. Kalau tidak ada, itu pertanyaan besar.",
    ],
    'instalasi': [
        "Kualitas instalasi menentukan 60 persen hasil akhir. Komponen mahal dengan instalasi asal-asalan, hasilnya pasti mengecewakan. Sebaliknya, komponen moderate dengan instalasi rapi, hasilnya bisa mengejutkan.",
        "Kabel yang ditata berantakan bukan cuma soal estetika. Kabel power dan kabel signal yang paralel bisa menyebabkan noise induksi, itu masalah nyata.",
        "Sambungan kabel yang disolder lebih reliable daripada crimp asal. Tapi harus disolder dengan benar, jangan sampai cold solder joint yang justru sumber masalah.",
        "Baffle speaker sering diabaikan, padahal fungsinya krusial. Tanpa baffle yang benar, suara dari depan dan belakang speaker saling mencancel, midbass hilang.",
        "Panel interior yang dipasang kembali tidak rapi bisa bergetar dan merusak suara. Ini detail kecil tapi dampaknya besar pada pengalaman dengar.",
        "Pengujian setelah instalasi wajib. Tes berbagai genre, berbagai volume. Kalau ada masalah, lebih baik ketahuan sekarang daripada setelah pelanggan pulang.",
        "Akses servis harus dipikirkan. Instalasi yang terlalu permanen akan menyulitkan maintenance. Teknisi yang baik memikirkan ini sejak awal pengerjaan.",
    ],
    'general': [
        "Audio mobil bukan soal siapa yang paling mahal komponennya. Sistem yang seimbang, terpasang rapi, dan disetel sesuai kebutuhan pemilik, itu yang memberi kepuasan mendengar.",
        "Konsultasi itu gratis, jangan ragu bertanya. Teknisi yang baik akan senang menjelaskan, bukan malah menyuruh pelanggan langsung beli paket.",
        "Telinga adalah hakim terbaik. Jangan terjebak angka spesifikasi atau review online. Yang penting adalah Anda sendiri nyaman mendengarkan.",
        "Innovation Car Audio sudah 20 tahun di industri ini. Kami belajar dari setiap mobil yang kami garap — tidak ada satu solusi yang cocok untuk semua.",
        "Track record 559+ piala bukan cuma angka. Itu bukti komitmen kami pada kualitas, dan validasi bahwa sistem yang kami install competition-grade.",
        "Pelanggan yang puas akan kembali, dan mereka akan bawa teman. Itu filosofi kami di Innovation Car Audio, kualitas di atas segalanya.",
        "Jangan malu kalau belum paham audio mobil. Itu pekerjaan kami untuk menjelaskan. Kalau installer malas menjawab, cari yang lain.",
    ],
}


def pick_quotes(title, cat_raw):
    """Pick 2 most relevant quotes based on title keywords."""
    t = title.lower()
    relevant_pools = []

    # Categorize title
    if any(k in t for k in PEREDAM_KEYWORDS):
        relevant_pools.append('peredam')
    if any(k in t for k in SPEAKER_KEYWORDS):
        relevant_pools.append('speaker')
    if any(k in t for k in AMP_KEYWORDS):
        relevant_pools.append('amplifier')
    if any(k in t for k in SUB_KEYWORDS):
        relevant_pools.append('subwoofer')
    if any(k in t for k in DSP_KEYWORDS):
        relevant_pools.append('dsp')
    if 'paket' in t or 'anggaran' in t or 'upgrade' in t or 'biaya' in t:
        relevant_pools.append('paket')
    if 'instalasi' in t or 'pemasangan' in t or 'kabel' in t:
        relevant_pools.append('instalasi')

    # Always include general as fallback
    relevant_pools.append('general')

    # Collect all relevant quotes
    all_quotes = []
    for pool in relevant_pools:
        all_quotes.extend([(pool, q) for q in QUOTES.get(pool, [])])

    # Pick 2 different quotes (different pools preferred)
    if len(all_quotes) >= 2:
        # Try to pick from different pools
        seen_pools = set()
        chosen = []
        random.shuffle(all_quotes)
        for pool, q in all_quotes:
            if pool not in seen_pools:
                chosen.append((pool, q))
                seen_pools.add(pool)
            if len(chosen) >= 2:
                break
        # If not enough, just pick any 2
        if len(chosen) < 2:
            for pool, q in all_quotes:
                if (pool, q) not in chosen:
                    chosen.append((pool, q))
                if len(chosen) >= 2:
                    break
        return chosen[:2]
    return [('general', all_quotes[0][1])]


# ============================================================
# Hook templates per topic
# ============================================================
def get_hook(title, keyword, keyword_alt):
    """Generate hook sentence with keyword."""
    t = title.lower()

    hooks = {
        'peredam': [
            f"Bagi pemilik mobil di Jakarta, kualitas audio car tidak lepas dari kondisi akustik kabin. Salah satu faktor yang sering luput dari perhatian adalah peredam suara.",
            f"Peredam suara mobil kerap dianggap pelengkap, padahal perannya krusial bagi kualitas audio car di kabin kendaraan.",
            f"Kebisingan jalan dan getaran panel bisa merusak pengalaman mendengarkan audio car. Di sinilah peredam suara memainkan peran penting.",
        ],
        'speaker': [
            f"Dalam dunia audio car, pemilihan speaker kerap menjadi titik awal pembahasan ketika pemilik mobil mempertimbangkan upgrade.",
            f"Speaker adalah komponen paling terlihat dalam sistem audio car, tapi pemilihannya tidak sesederhana mengambil yang paling mahal.",
            f"Audio car yang berkualitas dimulai dari speaker yang tepat. Tapi banyak yang salah persepsi, mengira speaker mahal otomatis berarti suara bagus.",
        ],
        'amplifier': [
            f"Pemilihan amplifier yang sesuai kebutuhan menjadi pertimbangan penting dalam sistem audio car modern.",
            f"Dalam audio car, amplifier bukan sekadar soal daya, tapi tentang matching yang tepat dengan speaker.",
            f"Banyak pemilik mobil terjebak mitos watt besar dalam audio car, padahal matching amplifier-speaker jauh lebih penting.",
        ],
        'subwoofer': [
            f"Subwoofer dan pengaturan low bass menjadi salah satu topik paling sering dibahas dalam audio car.",
            f"Bagi penggemar audio car, subwoofer adalah komponen yang kerap mendapat perhatian khusus.",
            f"Bass yang dalam dan terkontrol adalah dambaan setiap penggemar audio car. Di sinilah subwoofer berperan sentral.",
        ],
        'dsp': [
            f"Penyetelan digital melalui DSP menjadi bagian penting dalam audio car modern, terutama yang menargetkan kualitas suara terarah.",
            f"Dalam audio car, DSP kini menjadi perangkat yang sulit dipisahkan dari sistem modern.",
            f"Banyak pemilik audio car terkejut mengetahui bahwa DSP bisa mengubah karakter suara secara signifikan.",
        ],
        'paket': [
            f"Pemilihan paket audio car yang sesuai dengan anggaran dan kebutuhan menjadi langkah awal yang menentukan arah upgrade.",
            f"Bagi yang baru mempertimbangkan upgrade audio car, banyaknya pilihan paket bisa membingungkan.",
            f"Paket audio car yang baik bukan soal harga, tapi soal komposisi yang seimbang antar komponen.",
        ],
        'instalasi': [
            f"Kualitas instalasi menentukan sejauh mana komponen audio car dapat bekerja optimal di dalam kabin.",
            f"Dalam audio car, instalasi yang rapi dan benar sering lebih penting daripada komponen mahal.",
            f"Banyak masalah audio car sebenarnya berakar pada instalasi yang tidak tepat.",
        ],
        'general': [
            f"Topik ini menjadi salah satu aspek yang sering dibahas dalam konteks audio car dan peredam suara mobil.",
            f"Dalam dunia audio car, pemahaman tentang dasar sistem menjadi langkah awal yang penting.",
            f"Audio car dan peredam suara adalah dua aspek yang saling berkaitan dalam peningkatan kualitas suara mobil.",
        ],
    }

    # Determine topic
    if any(k in t for k in PEREDAM_KEYWORDS):
        topic = 'peredam'
    elif any(k in t for k in SPEAKER_KEYWORDS):
        topic = 'speaker'
    elif any(k in t for k in SUB_KEYWORDS):
        topic = 'subwoofer'
    elif any(k in t for k in AMP_KEYWORDS):
        topic = 'amplifier'
    elif any(k in t for k in DSP_KEYWORDS):
        topic = 'dsp'
    elif 'paket' in t or 'anggaran' in t or 'upgrade' in t:
        topic = 'paket'
    elif 'instalasi' in t or 'pemasangan' in t or 'kabel' in t:
        topic = 'instalasi'
    else:
        topic = 'general'

    return random.choice(hooks[topic]), topic


# ============================================================
# Generate article content
# ============================================================
def generate_content(title, cat_raw):
    """Generate ~2000-2500 char journalistic article with narasumber quotes."""
    keyword, keyword_alt, cat_slug, cat_id = get_keyword_for_title(title, cat_raw)
    hook, topic = get_hook(title, keyword, keyword_alt)
    quotes = pick_quotes(title, cat_raw)

    # Sub-headings based on topic (pakai ## bukan ### supaya lebih prominent)
    if topic == 'peredam':
        sub1 = "## Peran peredam dalam audio car"
        sub2 = "## Yang perlu ditanyakan sebelum pemasangan"
    elif topic == 'speaker':
        sub1 = "## Karakter speaker dan pengaruhnya pada audio car"
        sub2 = "## Tips memilih speaker untuk kebutuhan Anda"
    elif topic == 'amplifier':
        sub1 = "## Daya amplifier dan kebutuhan sistem"
        sub2 = "## Kesalahan umum dalam pemilihan amplifier"
    elif topic == 'subwoofer':
        sub1 = "## Subwoofer dan pengaturan bass"
        sub2 = "## Pemilihan enclosure yang tepat"
    elif topic == 'dsp':
        sub1 = "## DSP dan pengaturan suara"
        sub2 = "## Kesalahan umum dalam tuning DSP"
    elif topic == 'paket':
        sub1 = "## Cara menyusun anggaran audio car"
        sub2 = "## Yang perlu dicek sebelum membeli paket"
    elif topic == 'instalasi':
        sub1 = "## Aspek penting dalam instalasi audio car"
        sub2 = "## Detail kecil yang berdampak besar"
    else:
        sub1 = "## Memahami dasar sistem audio car"
        sub2 = "## Yang perlu dipertimbangkan"

    # Build content
    content_parts = []

    # Dateline + Hook
    content_parts.append(f"JAKARTA — {hook}")

    # Intro paragraph 2 — Innovation Car Audio context
    content_parts.append(
        f"Innovation Car Audio, workshop audio car dan peredam suara yang berbasis di Jakarta, "
        f"kerap menyoroti persoalan ini melalui pendekatan sistem yang seimbang. {keyword_alt} "
        f"yang berkualitas tidak selalu berarti komponen paling mahal, melainkan kerja sama antar "
        f"perangkat yang dipasang dan disetel dengan benar."
    )

    # Narasumber intro + Quote 1
    content_parts.append(
        f"Ko Lukito Tjandra, teknisi senior Innovation Car Audio, menjelaskan bahwa {topic} "
        f"memerlukan perhatian khusus agar sistem audio car bekerja optimal."
    )
    # Quote 1: pakai markdown blockquote (>) supaya render sebagai <blockquote>
    # Format: > "quote text"
    # >
    # > *— Ko Lukito Tjandra, teknisi senior Innovation Car Audio*
    content_parts.append(
        f"> **\"{quotes[0][1]}\"**\n>\n> *— Ko Lukito Tjandra, teknisi senior Innovation Car Audio*"
    )

    # Sub-heading 1 + body
    content_parts.append(sub1)
    content_parts.append(
        f"Dalam praktik, setiap kendaraan memiliki karakter kabin yang berbeda. Posisi duduk pengemudi, "
        f"letak speaker, material interior, hingga tingkat kebisingan dari jalan dapat memengaruhi apa "
        f"yang didengar pengguna. Karena itu, paket {keyword_alt} yang berfungsi baik di satu mobil "
        f"belum tentu memberi hasil identik di mobil lain."
    )
    content_parts.append(
        f"Bagi pemilik mobil, pendekatan yang lebih masuk akal adalah menentukan persoalan utama terlebih "
        f"dahulu. Apakah vokal terasa tipis, bass tidak terkontrol, atau suara terdengar melelahkan saat "
        f"volume dinaikkan? Jawaban ini membantu menyusun prioritas sebelum membeli komponen {keyword}."
    )

    # Sub-heading 2 + Quote 2
    content_parts.append(sub2)
    content_parts.append(
        f"Banyak pemilik mobil terjebak pada angka spesifikasi atau klaim pemasaran, padahal hasil akhir "
        f"sangat bergantung pada instalasi dan penyetelan. Innovation Car Audio menekankan pentingnya "
        f"konsultasi sebelum menentukan paket, agar setiap komponen memiliki fungsi yang jelas."
    )
    # Quote 2: pakai markdown blockquote (>)
    content_parts.append(
        f"> **\"{quotes[1][1]}\"**\n>\n> *— Ko Lukito Tjandra, Innovation Car Audio*"
    )

    # Closing paragraph
    content_parts.append(
        f"Pada akhirnya, sistem {keyword} yang baik bukan tentang komponen paling mahal atau paling populer. "
        f"Kesesuaian konfigurasi dengan kebutuhan pengguna, pemasangan yang benar, dan penyetelan yang tepat "
        f"merupakan bagian penting dari hasil akhir. Bagi calon pelanggan di Jakarta dan sekitarnya, "
        f"konsultasi dengan teknisi berpengalaman menjadi langkah awal yang paling efektif sebelum "
        f"menentukan paket upgrade."
    )

    # Catatan akhir
    content_parts.append(
        f"*Innovation Car Audio Jakarta melayani upgrade audio car dan peredam suara mobil untuk "
        f"wilayah Jabodetabek. Konsultasi gratis via WhatsApp atau kunjungi workshop untuk test dengar.*"
    )

    return '\n\n'.join(content_parts), keyword, keyword_alt, cat_slug, cat_id


def generate_excerpt(title, content, keyword):
    """Generate SEO-friendly excerpt with keyword at start."""
    # Take first paragraph after dateline
    first_para = content.split('\n\n')[0].replace('JAKARTA — ', '')
    if len(first_para) > 180:
        first_para = first_para[:177] + '...'
    return first_para


def add_keyword_to_title(title, keyword):
    """Add keyword to title for SEO if not already present."""
    t = title.lower()
    if keyword == 'audio car':
        if 'audio car' in t or 'audio mobil' in t:
            return title  # Already has keyword
        # Add "Audio Car" natural to title
        # If title has "Audio Mobil" → replace with "Audio Car"
        if 'audio mobil' in t:
            return title.replace('Audio Mobil', 'Audio Car').replace('audio mobil', 'audio car')
        # Else append context
        if ':' in title:
            base, suffix = title.split(':', 1)
            return f"{base} Audio Car:{suffix}"
        return f"{title} untuk Audio Car"
    elif keyword == 'peredam':
        if 'peredam' in t:
            return title  # Already has keyword
        # Add "Peredam" context
        if ':' in title:
            base, suffix = title.split(':', 1)
            return f"{base} Peredam:{suffix}"
        return f"{title} dan Peredam Suara Mobil"
    return title


# ============================================================
# Main
# ============================================================
def main():
    print("Parsing 500 titles from input file...")
    titles = parse_titles()
    print(f"Found {len(titles)} titles\n")

    print("Generating 500 articles with narasumber quotes...")
    # Load existing backup
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    existing_articles = data.get('articles', [])

    # Separate: keep 121 original (non art-500-*) + remove 500 generated (art-500-*)
    original_articles = [a for a in existing_articles if not a.get('id', '').startswith('art-500-')]
    print(f"Keeping {len(original_articles)} original articles")
    print(f"Replacing {len(existing_articles) - len(original_articles)} generated articles")

    base_date = datetime(2026, 1, 1, 8, 0, 0)
    new_articles = []
    existing_slugs = {a.get('slug') for a in original_articles}

    for i, t in enumerate(titles):
        title_orig = t['title']
        cat_raw = t['category_raw']

        # Generate content
        content, keyword, keyword_alt, cat_slug, cat_id = generate_content(title_orig, cat_raw)

        # SEO: Add keyword to title
        title_seo = add_keyword_to_title(title_orig, keyword)

        excerpt = generate_excerpt(title_seo, content, keyword)
        image = pick_image(title_seo, content)
        slug = slugify(title_seo)

        # Handle slug conflicts
        if slug in existing_slugs:
            slug = f"{slug}-{t['num']}"
        existing_slugs.add(slug)

        pub_date = base_date + timedelta(days=i // 2, hours=i % 24, minutes=(i * 7) % 60)

        article = {
            'id': f'art-500-{t["num"]:03d}-{random.randint(10000000, 99999999)}',
            'title': title_seo,
            'slug': slug,
            'excerpt': excerpt,
            'content': content,
            'contentHtml': None,
            'imageUrl': image,
            'galleryImages': [image],
            'category': None,
            'categoryId': cat_id,
            'tags': [
                keyword.replace(' ', '-'),
                keyword_alt.replace(' ', '-'),
                'innovation-car-audio',
                'ko-lukito-tjandra',
                'audio-mobil',
                'jakarta',
            ],
            'author': 'Innovation Car Audio',
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

    # Combine: original 121 + 500 new
    all_articles = original_articles + new_articles

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

    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Generated {len(new_articles)} new articles with narasumber quotes")
    print(f"✓ Total articles in backup: {len(deduped)}")
    print(f"✓ Saved to {BACKUP_FILE}")

    # Stats
    cats = {}
    keywords_count = {'audio car': 0, 'peredam': 0}
    for a in new_articles:
        cid = (a.get('categoryId') or '')[:12]
        cats[cid] = cats.get(cid, 0) + 1
        # Count keyword occurrences in content
        c = a.get('content', '').lower()
        if 'audio car' in c:
            keywords_count['audio car'] += 1
        if 'peredam' in c:
            keywords_count['peredam'] += 1

    print("\nNew articles by categoryId:")
    for c, n in sorted(cats.items()):
        print(f"  {c}...: {n}")
    print("\nKeyword distribution:")
    for k, n in keywords_count.items():
        print(f"  '{k}': {n} articles")

    # Sample
    print(f"\nSample article (first):")
    print(f"  Title: {new_articles[0]['title'][:80]}")
    print(f"  Slug: {new_articles[0]['slug']}")
    print(f"  Content length: {len(new_articles[0]['content'])} chars")
    print(f"  Image: {new_articles[0]['imageUrl']}")
    print(f"  Tags: {new_articles[0]['tags']}")
    print(f"  Author: {new_articles[0]['author']}")
    print()
    print("Content preview (first 800 chars):")
    print(new_articles[0]['content'][:800])

    print(f"\nSample article (last):")
    print(f"  Title: {new_articles[-1]['title'][:80]}")
    print(f"  Slug: {new_articles[-1]['slug']}")


if __name__ == '__main__':
    main()
