#!/usr/bin/env python3
"""
Generate 500 articles — V3 with 5000+ chars, santai portal media style.

V3 changes:
- Target 5000+ chars per article (was ~2500)
- Style: santai, gaya portal media (Kompas/Detik style)
- 4 sub-headings (was 2)
- 8 body paragraphs (was 4)
- 3 quotes from Ko Lukito Tjandra (was 2)
- Added 'Tips Praktis' section
- Added 'Yang Perlu Diperhatikan' section
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
# Category config
# ============================================================
CAT_CONFIG = {
    'Dasar audio mobil': {
        'categoryId': 'cmto5qnif0001qi2tcli98oxw',
        'categorySlug': 'upgrade-audio',
        'keyword': 'audio car',
        'keyword_alt': 'audio mobil',
    },
    'Speaker dan penempatan': {
        'categoryId': 'cmto5qnid0000qi2tvgkg09fk',
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

PEREDAM_KEYWORDS = ['peredam', 'damping', 'soundproofing', 'peredaman', 'getar', 'kabin']
SPEAKER_KEYWORDS = ['speaker', 'tweeter', 'midrange', 'midbass', 'coaxial', 'component', 'polaritas', 'baffle']
AMP_KEYWORDS = ['amplifier', 'power', 'rms', 'gain', 'fuse', 'grounding', 'kelistrikan', 'kabel', 'clipping', 'distorsi', 'watt', 'daya']
SUB_KEYWORDS = ['subwoofer', 'bass', 'box', 'sealed', 'ported', 'enclosure']
DSP_KEYWORDS = ['dsp', 'tuning', 'crossover', 'equalization', 'eq ', 'time alignment', 'phase', 'processor']


def get_keyword_for_title(title, cat_raw):
    t = title.lower()
    if any(k in t for k in PEREDAM_KEYWORDS):
        return 'peredam', 'peredam suara mobil', 'peredam-mobil', 'cmto5qnid0000qi2tvgkg09fk'
    cfg = CAT_CONFIG.get(cat_raw, CAT_CONFIG['Dasar audio mobil'])
    return cfg['keyword'], cfg['keyword_alt'], cfg['categorySlug'], cfg['categoryId']


# ============================================================
# Pool kutipan narasumber Ko Lukito Tjandra (expanded for V3)
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
        "Speaker component jelas lebih baik dari coaxial, tapi syaratnya dipasang dengan benar. Kalau asal pasang, coaxial yang dipasang rapi bisa kalahkan component yang dipasang asal.",
    ],
    'amplifier': [
        "Amplifier bukan tentang watt terbesar, tapi tentang matching dengan speaker. Amplifier 50 watt RMS yang tepat bisa mengalahkan amplifier 200 watt yang tidak matching.",
        "Gain bukan volume. Gain yang disetel terlalu tinggi adalah penyebab utama distorsi dan kerusakan speaker. Banyak installer muda yang masih salah di sini.",
        "Grounding yang buruk adalah sumber noise paling umum di sistem audio mobil. Sebelum ganti amplifier, cek dulu kabel ground-nya, itu sering kali akar masalahnya.",
        "Kelistrikan mobil harus dipikirkan dari awal. Tambahan amplifier berdaya besar butuh kabel power yang sesuai dan fuse yang tepat. Ini soal keselamatan, bukan sekadar suara.",
        "Clipping itu musuh utama speaker. Banyak orang menyalahkan speaker pecah karena kualitas, padahal sebenarnya amplifier clipping yang merusaknya.",
        "Amplifier Class D sekarang sudah sangat baik. Mitos bahwa Class AB selalu lebih bagus itu sudah tidak sepenuhnya benar untuk pemakaian daily.",
        "Noise alternator sering muncul karena grounding amplifier dan head unit tidak konsisten. Satu titik ground yang benar bisa menyelesaikan banyak masalah.",
        "Amplifier 5 channel itu solusi hemat space, tapi jangan salah pilih. Yang murah-murah sering noise dan cepat panas, mendingan invest di brand terpercaya.",
    ],
    'subwoofer': [
        "Subwoofer bukan soal ukuran terbesar, tapi soal matching dengan kabin dan enclosure yang tepat. Sub 8 inch yang benar setting-nya bisa kalahkan sub 12 inch yang asal pasang.",
        "Box subwoofer menentukan 50 persen karakter bass. Subwoofer yang sama bisa terdengar berbeda di sealed box vs ported box. Ini bukan detail kecil.",
        "Volume box subwoofer harus dihitung berdasarkan spesifikasi driver. Asal potong kayu sesuai ukuran bagasi akan menghasilkan bass yang tidak terkontrol.",
        "Subwoofer bawah jok itu solusi cerdas untuk yang tidak mau hilang ruang bagasi. Tapi harus pilih subwoofer compact yang dirancang untuk instalasi underseat.",
        "Bass yang baik itu terasa, bukan terdengar. Kalau Anda masih 'mendengar' bass sebagai bunyi terpisah, berarti integrasi subwoofer dengan speaker belum benar.",
        "Power mono untuk subwoofer itu investasi yang tepat. Amplifier 4 channel yang dipakai untuk speaker dan sub sering tidak optimal untuk keduanya.",
        "Subwoofer 10 inch adalah sweet spot untuk daily use. Cukup dalam untuk bass, tidak terlalu boros ruang, dan mudah di-drive oleh amplifier moderate.",
        "Ported box itu lebih kencang tapi kurang akurat. Sealed box lebih tight tapi kurang dalam. Pilih sesuai selera musik, jangan asal ikut tren.",
    ],
    'dsp': [
        "DSP bukan alat ajaib. Tanpa instalasi yang benar, DSP tidak akan menyelesaikan masalah. Banyak orang beli DSP mahal tapi hasilnya mengecewakan karena instalasinya amburadul.",
        "Time alignment adalah fitur DSP yang paling sering diabaikan, padahal dampaknya paling besar. Bayangkan semua speaker sampai ke telinga Anda pada waktu yang sama — itu panggung suara yang benar.",
        "Equalizer bukan untuk membuat suara 'bagus'. EQ untuk koreksi masalah akustik kabin, bukan untuk menutupi kelemahan instalasi. Banyak orang salah pakai EQ.",
        "Crossover slope harus dipilih berdasarkan kemampuan speaker dan karakter kabin. Slope 12 dB berbeda hasilnya dengan 24 dB, ini bukan angka yang bisa diacak-acak.",
        "Preset dari mobil lain jangan disalin mentah-mentah. Setiap kabin punya karakter akustik berbeda, preset yang bagus di Avanza belum tentu bagus di Brio.",
        "DSP tuning itu proses, bukan sekali setting langsung jadi. Butuh test dengar berbagai genre, evaluasi, adjust, test lagi. Tidak ada shortcut untuk hasil yang benar.",
        "Banyak fitur DSP tidak menjamin kualitas. Yang penting adalah teknisi memahami apa yang dia setel, bukan sekadar mengikuti angka dari tutorial online.",
        "DSP 10 channel itu powerful, tapi kalau teknisinya tidak mampu tune, mendingan 6 channel yang di-tune benar. Banyak channel bukan jaminan suara bagus.",
    ],
    'peredam': [
        "Peredam bukan sekadar menambah material. Diagnosis sumber kebisingan adalah kunci. Bukan berarti seluruh mobil harus dilapisi, itu justru menambah berat dan biaya tanpa hasil optimal.",
        "Peredam pintu itu investasi paling cost-effective untuk audio mobil. Begitu pintu diperedam dengan benar, speaker bawaan pun langsung terdengar lebih baik.",
        "Material peredam yang berbeda fungsi. Butyl untuk mass loading, absorber untuk menyerap suara, Nex untuk heat barrier. Tidak bisa pakai satu material untuk semua masalah.",
        "Peredam yang dipasang sembarangan bisa mengganggu mekanisme jendela, airbag samping, atau jalur pembuangan air. Pemasangan harus mengikuti prosedur yang benar.",
        "Peredam kap mesin itu dua manfaat: kurangi panas dan kurangi noise mesin. Bagi yang sering macet di Jakarta, ini investasi kenyamanan yang sangat worth it.",
        "Banyak orang kaget setelah peredam penuh, mobil terasa seperti kabin pesawat. Tapi ingat, peredam juga menambah berat, jadi hitung budget bensin juga.",
        "Peredam wheel housing paling berdampak untuk reduksi noise jalan. Tapi aksesnya paling sulit, jadi harus dikerjakan teknisi yang berpengalaman.",
        "Peredam firewall itu barrier antara mesin dan kabin. Banyak yang skip ini padahal dampaknya besar untuk noise mesin, terutama di mobil diesel.",
    ],
    'paket': [
        "Paket audio bukan soal harga termurah atau termahal. Yang penting adalah komponen di dalamnya saling melengkapi sebagai satu sistem, bukan kumpulan barang mahal yang tidak matching.",
        "Upgrade bertahap itu strategi yang cerdas. Tapi harus direncanakan dari awal, jangan beli speaker sekarang lalu ganti lagi tahun depan karena tidak cocok dengan amplifier yang dibeli kemudian.",
        "Anggaran audio mobil harus termasuk biaya instalasi, peredam, kabel, dan tuning. Banyak orang hanya hitung harga komponen, lalu kaget saat totalnya membengkak.",
        "Paket yang bagus untuk daily use berbeda dengan paket competition. Jangan paksa paket competition kalau daily use yang dibutuhkan — itu buang uang.",
        "Konsultasi sebelum beli itu penting. Teknisi yang baik akan bertanya kebiasaan mendengarkan Anda, bukan langsung menawarkan paket paling mahal.",
        "Garansi pengerjaan itu tanda workshop yang serius. Workshop yang tidak berani memberi garansi, biasanya tidak yakin dengan kualitas instalasinya sendiri.",
        "Test dengar sebelum commit. Workshop profesional pasti punya demo room atau demo car. Kalau tidak ada, itu pertanyaan besar.",
        "Jangan terjebak paket promo murah. Biasanya komponen-nya abal-abal dan instalasinya asal-asalan. Mending nabung dulu daripada beli paket murah yang hasilnya mengecewakan.",
    ],
    'instalasi': [
        "Kualitas instalasi menentukan 60 persen hasil akhir. Komponen mahal dengan instalasi asal-asalan, hasilnya pasti mengecewakan. Sebaliknya, komponen moderate dengan instalasi rapi, hasilnya bisa mengejutkan.",
        "Kabel yang ditata berantakan bukan cuma soal estetika. Kabel power dan kabel signal yang paralel bisa menyebabkan noise induksi, itu masalah nyata.",
        "Sambungan kabel yang disolder lebih reliable daripada crimp asal. Tapi harus disolder dengan benar, jangan sampai cold solder joint yang justru sumber masalah.",
        "Baffle speaker sering diabaikan, padahal fungsinya krusial. Tanpa baffle yang benar, suara dari depan dan belakang speaker saling mencancel, midbass hilang.",
        "Panel interior yang dipasang kembali tidak rapi bisa bergetar dan merusak suara. Ini detail kecil tapi dampaknya besar pada pengalaman dengar.",
        "Pengujian setelah instalasi wajib. Tes berbagai genre, berbagai volume. Kalau ada masalah, lebih baik ketahuan sekarang daripada setelah pelanggan pulang.",
        "Akses servis harus dipikirkan. Instalasi yang terlalu permanen akan menyulitkan maintenance. Teknisi yang baik memikirkan ini sejak awal pengerjaan.",
        "Pemasangan kabel power harus pakai grommet di tembok firewall. Kalau langsung tembus tanpa grommet, lama-lama kabel tergesek dan bisa korsing.",
    ],
    'general': [
        "Audio mobil bukan soal siapa yang paling mahal komponennya. Sistem yang seimbang, terpasang rapi, dan disetel sesuai kebutuhan pemilik, itu yang memberi kepuasan mendengar.",
        "Konsultasi itu gratis, jangan ragu bertanya. Teknisi yang baik akan senang menjelaskan, bukan malah menyuruh pelanggan langsung beli paket.",
        "Telinga adalah hakim terbaik. Jangan terjebak angka spesifikasi atau review online. Yang penting adalah Anda sendiri nyaman mendengarkan.",
        "Innovation Car Audio sudah 20 tahun di industri ini. Kami belajar dari setiap mobil yang kami garap — tidak ada satu solusi yang cocok untuk semua.",
        "Track record 559+ piala bukan cuma angka. Itu bukti komitmen kami pada kualitas, dan validasi bahwa sistem yang kami install competition-grade.",
        "Pelanggan yang puas akan kembali, dan mereka akan bawa teman. Itu filosofi kami di Innovation Car Audio, kualitas di atas segalanya.",
        "Jangan malu kalau belum paham audio mobil. Itu pekerjaan kami untuk menjelaskan. Kalau installer malas menjawab, cari yang lain.",
        "Audio mobil itu investasi jangka panjang. Jangan buru-buru, ambil waktu untuk riset dan konsultasi. Hasilnya akan jauh lebih memuaskan.",
    ],
}


def pick_quotes(title, cat_raw):
    """Pick 3 most relevant quotes based on title keywords."""
    t = title.lower()
    relevant_pools = []
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
    relevant_pools.append('general')

    all_quotes = []
    for pool in relevant_pools:
        all_quotes.extend([(pool, q) for q in QUOTES.get(pool, [])])

    if len(all_quotes) >= 3:
        seen_pools = set()
        chosen = []
        random.shuffle(all_quotes)
        for pool, q in all_quotes:
            if pool not in seen_pools:
                chosen.append((pool, q))
                seen_pools.add(pool)
            if len(chosen) >= 3:
                break
        if len(chosen) < 3:
            for pool, q in all_quotes:
                if (pool, q) not in chosen:
                    chosen.append((pool, q))
                if len(chosen) >= 3:
                    break
        return chosen[:3]
    return [('general', all_quotes[0][1])] * 3


# ============================================================
# Hook templates — santai portal media style
# ============================================================
def get_hook(title, keyword, keyword_alt):
    t = title.lower()
    hooks = {
        'peredam': [
            f"Siapa sangka, kualitas audio car di mobil kamu bisa berubah drastis cuma dengan nambah peredam yang tepat. Banyak pemilik mobil yang baru sadar setelah coba sendiri, ternyata suara speaker mahal jadi maksimal kalau kabinnya sudah 'diam' dari kebisingan luar.",
            f"Mungkin kamu mikir peredam cuma buat ngurangin suara mesin atau jalan. Padahal di dunia audio car, peredam itu salah satu kunci utama biar musik yang keluar dari speaker bener-bener jernih, bukan bercampur sama getaran panel bodi yang bikin berisik.",
            f"Buat kamu yang sering keliling Jakarta dan capek sama suara jalan yang bising, peredam suara mobil bisa jadi solusi. Sekalian, kualitas audio car di mobil kamu juga bakal naik kelas. Win-win kan?",
        ],
        'speaker': [
            f"Bicara audio car, speaker jadi bintang utama yang paling sering dibahas. Tapi jangan salah, pilih speaker itu bukan cuma soal harga atau merek. Banyak yang beli speaker mahal tapi kecewa karena nggak cocok sama kabin mobilnya.",
            f"Pernah nggak kamu ngerasa speaker bawaan mobil terasa 'geblek' atau kurang bertenaga? Itu sebenarnya wajar, dan bukan berarti harus langsung ganti speaker baru. Ada beberapa hal yang perlu dicek dulu sebelum ngeluarin uang.",
            f"Di dunia audio car, speaker itu ibarat penyanyi utama di band. Sebagus apapun alat musiknya, kalau penyanyinya nggak pas, hasilnya tetap nggak enak. Makanya pilih speaker itu butuh perhatian khusus, jangan asal beli.",
        ],
        'amplifier': [
            f"Mitos paling umum di dunia audio car: amplifier watt besar pasti bikin suara makin kenceng dan bagus. Padahal kenyataannya, amplifier yang nggak matching sama speaker justru bisa merusak komponen, lho. Yuk, bahas tuntas soal ini.",
            f"Pernah denger istilah 'amplifier ngeclip'? Itu kondisi yang bikin suara jadi pecah dan bisa bikin speaker kamu rusak permanen. Sayangnya, banyak installer pemula yang masih salah setel gain amplifier.",
            f"Buat kamu yang baru mau upgrade audio car, amplifier itu komponen yang sering bikin bingung. Mereknya banyak, typenya juga banyak, watt-nya beragam. Mana yang cocok? Mari kita bedah bersama-sama.",
        ],
        'subwoofer': [
            f"Bass yang menggebrak dada itu memang bikin nagih. Tapi subwoofer itu bukan cuma soal ukuran atau watt, lho. Banyak yang beli subwoofer gede tapi pasangnya asal-asalan, hasilnya bass malah berantakan dan bikin sakit kepala.",
            f"Pernah lihat mobil yang sound system-nya sampai kaca jendela bergetar? Itu bukan soal subwoofer yang mahal, tapi soal instalasi dan enclosure yang benar. Kita bahas tuntas yuk, biar kamu nggak buang uang percuma.",
            f"Subwoofer itu ibarat jantungnya low bass di sistem audio car. Tanpa subwoofer yang pas, musik kamu bakal terasa 'kosong' di bawah. Tapi pilih subwoofer yang salah, malah bisa bikin seluruh sistem terdengar berantakan.",
        ],
        'dsp': [
            f"DSP atau Digital Signal Processor itu kayak 'otak' yang ngatur semua sinyal audio di mobil kamu. Tanpa DSP yang di-tune dengan benar, speaker mahal pun bakal terdengar biasa saja. Tapi banyak yang masih nggak paham cara kerja DSP.",
            f"Pernah denger orang bilang 'DSP ajaib bikin suara jadi keren'? Well, nggak selalu. DSP itu cuma alat, yang menentukan hasilnya tetap teknisi yang tune. Kalau teknisinya nggak paham, DSP mahal pun jadi sia-sia.",
            f"Di era audio car modern, DSP sudah jadi standar. Tapi banyak yang beli DSP mahal tapi cuma dipakai untuk 'show off' fitur, padahal fitur yang penting justru nggak dipakai. Yuk, bahas fitur DSP yang benar-benar penting.",
        ],
        'paket': [
            f"Mau upgrade audio car tapi bingung pilih paket yang mana? Tenang, kamu nggak sendirian. Banyak pemilik mobil yang langsung ke shop audio dan langsung disodori paket mahal tanpa paham apa yang mereka beli.",
            f"Bicara anggaran audio car, banyak yang mikir 'yang mahal pasti bagus'. Padahal kenyataannya, paket yang sesuai kebutuhan itu jauh lebih worth it daripada paket mahal yang nggak cocok sama gaya dengar kamu.",
            f"Pernah ngelihat iklan paket audio car murah di sosial media? Hati-hati, banyak yang jebakan. Komponen abal-abal, instalasi asal-asalan, dan ujung-ujungnya kamu malah harus beli ulang. Kita bahas cara pilih paket yang benar.",
        ],
        'instalasi': [
            f"Kamu mungkin pernah denger kata-kata 'instalasi menentukan 60 persen hasil audio car'. Itu bukan omong kosong, lho. Banyak sistem audio mahal yang hasilnya mengecewakan cuma karena instalasi yang asal-asalan.",
            f"Bicara instalasi audio car, bukan cuma soal pasang speaker dan amplifier. Kabel, grounding, baffle, sampai panel interior yang dipasang kembali — semuanya pengaruh ke hasil akhir yang kamu denger.",
            f"Pernah nggak kamu merasa suara audio mobil kamu 'aneh' setelah instalasi? Ada noise, suara berdengung, atau speaker kayak nggak nyambung? Itu tandanya ada yang salah dengan instalasi, bukan dengan komponennya.",
        ],
        'general': [
            f"Audio car itu dunia yang seru tapi bisa bikin bingung kalau baru terjun. Banyak istilah, banyak pilihan, dan banyak opini yang kadang bertolak belakang. Yuk, kita bedah bareng-bareng biar nggak bingung lagi.",
            f"Buat kamu yang baru mulai tertarik dunia audio car, ada beberapa hal dasar yang perlu dipahami. Bukan soal beli komponen termahal, tapi soal paham cara kerja sistem audio secara keseluruhan.",
            f"Dunia audio car itu luas, mulai dari speaker, amplifier, subwoofer, DSP, sampai peredam. Semua saling terkait dan nggak bisa dipisahkan. Kita bahas satu per satu biar kamu makin paham.",
        ],
    }
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
# Generate article content — V3 with 5000+ chars
# ============================================================
def generate_content(title, cat_raw):
    keyword, keyword_alt, cat_slug, cat_id = get_keyword_for_title(title, cat_raw)
    hook, topic = get_hook(title, keyword, keyword_alt)
    quotes = pick_quotes(title, cat_raw)

    # Sub-headings based on topic
    if topic == 'peredam':
        sub1 = "## Apa itu peredam dan kenapa penting untuk audio car?"
        sub2 = "## Jenis-jenis material peredam yang perlu kamu tahu"
        sub3 = "## Kesalahan umum saat pasang peredam"
        sub4 = "## Tips praktis sebelum kamu pasang peredam"
    elif topic == 'speaker':
        sub1 = "## Karakter speaker dan pengaruhnya ke audio car"
        sub2 = "## Cara pilih speaker yang cocok buat kamu"
        sub3 = "## Kesalahan umum saat pilih speaker"
        sub4 = "## Tips praktis sebelum beli speaker"
    elif topic == 'amplifier':
        sub1 = "## Daya amplifier dan kebutuhan sistem audio car"
        sub2 = "## Jenis-jenis amplifier yang tersedia"
        sub3 = "## Kesalahan umum saat pilih amplifier"
        sub4 = "## Tips praktis sebelum beli amplifier"
    elif topic == 'subwoofer':
        sub1 = "## Subwoofer dan perannya di sistem audio car"
        sub2 = "## Jenis enclosure dan pengaruhnya ke bass"
        sub3 = "## Kesalahan umum saat pasang subwoofer"
        sub4 = "## Tips praktis sebelum beli subwoofer"
    elif topic == 'dsp':
        sub1 = "## DSP dan pengaturan suara di audio car"
        sub2 = "## Fitur-fitur DSP yang penting kamu pahami"
        sub3 = "## Kesalahan umum saat tuning DSP"
        sub4 = "## Tips praktis sebelum beli DSP"
    elif topic == 'paket':
        sub1 = "## Cara menyusun anggaran audio car yang cerdas"
        sub2 = "## Yang perlu kamu cek sebelum beli paket"
        sub3 = "## Kesalahan umum saat pilih paket audio"
        sub4 = "## Tips praktis sebelum commit beli paket"
    elif topic == 'instalasi':
        sub1 = "## Aspek penting dalam instalasi audio car"
        sub2 = "## Detail kecil yang berdampak besar"
        sub3 = "## Kesalahan umum dalam instalasi"
        sub4 = "## Tips praktis untuk instalasi yang rapi"
    else:
        sub1 = "## Memahami dasar sistem audio car"
        sub2 = "## Yang perlu kamu pertimbangkan"
        sub3 = "## Kesalahan umum yang harus dihindari"
        sub4 = "## Tips praktis buat kamu"

    content_parts = []

    # === INTRO (3 paragraphs) ===
    content_parts.append(f"JAKARTA — {hook}")

    content_parts.append(
        f"Innovation Car Audio, workshop {keyword} dan peredam suara yang berbasis di Jakarta, "
        f"kerap menyoroti persoalan ini. Dengan pengalaman lebih dari 20 tahun, workshop ini "
        f"sudah membantu ribuan pelanggan mendapatkan sistem {keyword_alt} yang sesuai dengan "
        f"kebutuhan dan budget mereka. Pendekatannya sederhana: nggak ada satu solusi untuk semua mobil."
    )

    content_parts.append(
        f"Buat kamu yang baru pertama kali kepikiran mau upgrade {keyword}, ada beberapa hal "
        f"yang perlu dipahami dulu. Bukan soal beli komponen termahal, tapi soal paham cara kerja "
        f"sistem secara keseluruhan. {keyword_alt} yang berkualitas itu hasil kerja sama antar "
        f"perangkat yang dipasang dan disetel dengan benar, bukan sekadar kumpulan barang mahal."
    )

    # === NARASUMBER INTRO + QUOTE 1 ===
    content_parts.append(
        f"Ko Lukito Tjandra, teknisi senior Innovation Car Audio, menjelaskan bahwa {topic} "
        f"itu salah satu aspek yang sering disalahpahami. Banyak pelanggan yang datang dengan "
        f"ekspektasi tinggi, tapi nggak paham proses yang sebenarnya terjadi di baliknya."
    )
    content_parts.append(
        f'> **"{quotes[0][1]}"**\n>\n> *— Ko Lukito Tjandra, teknisi senior Innovation Car Audio*'
    )

    # === SUB-HEADING 1 + BODY (3 paragraphs) ===
    content_parts.append(sub1)
    content_parts.append(
        f"Dalam praktiknya, setiap kendaraan punya karakter kabin yang berbeda. Posisi duduk pengemudi, "
        f"letak speaker, material interior, hingga tingkat kebisingan dari jalan — semua ini bisa "
        f"memengaruhi apa yang kamu dengar. Karena itu, paket {keyword_alt} yang terdengar bagus "
        f"di mobil teman, belum tentu memberi hasil yang sama di mobil kamu."
    )
    content_parts.append(
        f"Innovation Car Audio selalu mengedukasi pelanggannya soal ini. Mereka percaya bahwa "
        f"pelanggan yang paham akan lebih puas dengan hasilnya, dibanding pelanggan yang cuma "
        f"ikut-ikutan tren atau beli paket tanpa paham fungsinya. Workshop ini juga punya track "
        f"record 559+ piala di berbagai kontes audio mobil — bukti bahwa sistem yang mereka install "
        f"memang competition-grade, bukan cuma klaim pemasaran."
    )
    content_parts.append(
        f"Buat kamu yang masih bingung mulai dari mana, pendekatan yang paling masuk akal adalah "
        f"menentukan persoalan utama dulu. Apakah vokal terasa tipis? Bass terlalu berlebihan? "
        f"Atau suara terdengar melelahkan saat volume dinaikkan? Jawaban atas pertanyaan-pertanyaan "
        f"ini akan membantu kamu menyusun prioritas sebelum membeli komponen {keyword}."
    )

    # === SUB-HEADING 2 + BODY (2 paragraphs) + QUOTE 2 ===
    content_parts.append(sub2)
    content_parts.append(
        f"Banyak pemilik mobil yang terjebak pada angka spesifikasi atau klaim pemasaran dari "
        f"toko online. Padahal, hasil akhir sangat bergantung pada instalasi dan penyetelan, "
        f"bukan cuma komponennya. Innovation Car Audio menekankan pentingnya konsultasi sebelum "
        f"menentukan paket, supaya setiap komponen yang dibeli benar-benar punya fungsi yang jelas."
    )
    content_parts.append(
        f"Yang menarik, banyak pelanggan Innovation Car Audio yang awalnya cuma mau ganti speaker, "
        f"akhirnya sadar bahwa masalahnya bukan di speaker, tapi di instalasi atau peredam. Ini "
        f"salah satu alasan kenapa konsultasi itu penting — kamu nggak mau beli barang mahal tapi "
        f"masalahnya belum terselesaikan, kan?"
    )
    content_parts.append(
        f'> **"{quotes[1][1]}"**\n>\n> *— Ko Lukito Tjandra, Innovation Car Audio*'
    )

    # === SUB-HEADING 3 + BODY (2 paragraphs) + QUOTE 3 ===
    content_parts.append(sub3)
    content_parts.append(
        f"Berikut ini beberapa kesalahan umum yang sering ditemui di dunia {keyword_alt}. "
        f"Pertama, terlalu fokus pada satu komponen dan melupakan sistem secara keseluruhan. "
        f"Kedua, mengabaikan kualitas instalasi karena tergiur harga murah. Ketiga, nggak mau "
        f"konsultasi dulu sebelum beli, lalu akhirnya menyesal karena komponen yang dibeli nggak cocok."
    )
    content_parts.append(
        f"Innovation Car Audio kerap menerima pelanggan yang datang dengan komponen yang sudah "
        f"dibeli di tempat lain, tapi nggak bisa dipakai karena nggak matching atau instalasinya "
        f"bermasalah. Kasus seperti ini sebenarnya bisa dihindari kalau dari awal ada konsultasi "
        f"dengan teknisi yang berpengalaman. Ingat, mencegah lebih murah daripada mengobati."
    )
    content_parts.append(
        f'> **"{quotes[2][1]}"**\n>\n> *— Ko Lukito Tjandra, teknisi senior Innovation Car Audio*'
    )

    # === SUB-HEADING 4 + TIPS (list) ===
    content_parts.append(sub4)
    content_parts.append(
        f"Buat kamu yang mau mulai upgrade {keyword}, berikut beberapa tips praktis yang bisa "
        f"kamu lakukan sebelum memutuskan:"
    )
    content_parts.append(
        f"1. **Tentukan budget dulu.** Berapa maksimal yang kamu siap keluarkan? Jangan lupa "
        f"include biaya instalasi, peredam, kabel, dan tuning, bukan cuma harga komponen.\n\n"
        f"2. **Identifikasi masalah utama.** Apa yang nggak kamu suka dari sistem audio mobil "
        f"sekarang? Vokal kurang jelas? Bass lemah? Atau suara berisik? Jawaban ini jadi panduan.\n\n"
        f"3. **Konsultasi dengan teknisi.** Datang ke workshop yang punya track record, bukan "
        f"cuma toko yang jualan. Workshop yang baik akan bertanya kebutuhanmu, bukan langsung "
        f"nawarin paket termahal.\n\n"
        f"4. **Test dengar sebelum beli.** Workshop profesional pasti punya demo room atau demo car. "
        f"Kalau nggak ada, itu pertanda besar.\n\n"
        f"5. **Pikirkan upgrade path.** Kalau budget terbatas sekarang, tanya teknisi apakah "
        f"komponen yang kamu beli sekarang bisa di-upgrade nanti, atau harus ganti total.\n\n"
        f"6. **Minta garansi.** Workshop yang berani kasih garansi pengerjaan itu tanda mereka "
        f"yakin dengan kualitasnya. Yang nggak mau kasih garansi, patut dicurigai."
    )

    # === CLOSING ===
    content_parts.append(
        f"Pada akhirnya, sistem {keyword} yang baik bukan tentang komponen paling mahal atau "
        f"paling populer di forum. Kesesuaian konfigurasi dengan kebutuhan kamu, pemasangan yang "
        f"benar, dan penyetelan yang tepat — itu yang menentukan hasil akhir. Bagi calon pelanggan "
        f"di Jakarta dan sekitarnya, konsultasi dengan teknisi berpengalaman menjadi langkah awal "
        f"yang paling efektif sebelum menentukan paket upgrade."
    )

    content_parts.append(
        f"*Innovation Car Audio Jakarta melayani upgrade {keyword} dan peredam suara mobil untuk "
        f"wilayah Jabodetabek. Dengan pengalaman 20+ tahun dan 559+ piala kontes audio, workshop ini "
        f"sudah membantu ribuan pelanggan mendapatkan sistem audio mobil yang sesuai kebutuhan. "
        f"Konsultasi gratis via WhatsApp atau kunjungi workshop untuk test dengar.*"
    )

    return '\n\n'.join(content_parts), keyword, keyword_alt, cat_slug, cat_id


def generate_excerpt(title, content, keyword):
    first_para = content.split('\n\n')[0].replace('JAKARTA — ', '')
    if len(first_para) > 180:
        first_para = first_para[:177] + '...'
    return first_para


def add_keyword_to_title(title, keyword):
    t = title.lower()
    if keyword == 'audio car':
        if 'audio car' in t or 'audio mobil' in t:
            return title
        if 'audio mobil' in t:
            return title.replace('Audio Mobil', 'Audio Car').replace('audio mobil', 'audio car')
        if ':' in title:
            base, suffix = title.split(':', 1)
            return f"{base} Audio Car:{suffix}"
        return f"{title} untuk Audio Car"
    elif keyword == 'peredam':
        if 'peredam' in t:
            return title
        if ':' in title:
            base, suffix = title.split(':', 1)
            return f"{base} Peredam:{suffix}"
        return f"{title} dan Peredam Suara Mobil"
    return title


def main():
    print("Parsing 500 titles from input file...")
    titles = parse_titles()
    print(f"Found {len(titles)} titles\n")

    print("Generating 500 articles V3 (5000+ chars, santai portal media style)...")
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    existing_articles = data.get('articles', [])
    original_articles = [a for a in existing_articles if not a.get('id', '').startswith('art-500-')]
    print(f"Keeping {len(original_articles)} original articles")
    print(f"Replacing generated articles with V3 version")

    base_date = datetime(2026, 1, 1, 8, 0, 0)
    new_articles = []
    existing_slugs = {a.get('slug') for a in original_articles}

    for i, t in enumerate(titles):
        title_orig = t['title']
        cat_raw = t['category_raw']

        content, keyword, keyword_alt, cat_slug, cat_id = generate_content(title_orig, cat_raw)
        title_seo = add_keyword_to_title(title_orig, keyword)
        excerpt = generate_excerpt(title_seo, content, keyword)
        image = pick_image(title_seo, content)
        slug = slugify(title_seo)

        # Keep AI image if exists
        OUTPUT_DIR = Path('/home/z/my-project/public/article-images-ai')
        ai_image_path = OUTPUT_DIR / f'{slug}.png'
        if ai_image_path.exists() and ai_image_path.stat().st_size > 5000:
            image = f'/article-images-ai/{slug}.png'

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

    all_articles = original_articles + new_articles
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

    print(f"\n✓ Generated {len(new_articles)} new articles V3")
    print(f"✓ Total articles in backup: {len(deduped)}")

    # Stats — content length
    lengths = [len(a['content']) for a in new_articles]
    print(f"\nContent length stats:")
    print(f"  Min: {min(lengths)} chars")
    print(f"  Max: {max(lengths)} chars")
    print(f"  Avg: {sum(lengths)/len(lengths):.0f} chars")
    print(f"  Articles with 5000+ chars: {len([l for l in lengths if l >= 5000])}")
    print(f"  Articles with 4500+ chars: {len([l for l in lengths if l >= 4500])}")

    # Sample
    print(f"\nSample article (first):")
    print(f"  Title: {new_articles[0]['title'][:80]}")
    print(f"  Slug: {new_articles[0]['slug']}")
    print(f"  Content length: {len(new_articles[0]['content'])} chars")
    print(f"  Image: {new_articles[0]['imageUrl']}")


if __name__ == '__main__':
    main()
