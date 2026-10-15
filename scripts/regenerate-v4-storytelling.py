#!/usr/bin/env python3
"""
Regenerate 121 artikel (21 original + 100 V2) dengan format V4:
- Natural jurnalis (gaya berita santai portal media)
- CTA (Call to Action)
- FOMO (Fear of Missing Out)
- Storytelling (cerita yang mengalir)
- Target: 5000+ chars per artikel
- 3 quotes dari Ko Lukito Tjandra
- 4 sub-headings
- Tips list
"""
import json
import re
import random
from pathlib import Path
from datetime import datetime, timedelta

random.seed(99)

BACKUP_FILE = Path('/home/z/my-project/data/backup-sqlite.json')
AI_DIR = Path('/home/z/my-project/public/article-images-ai')

# ============================================================
# Image assignment (reuse from assign-ai-images-all.py)
# ============================================================
def detect_topic(title):
    t = title.lower()
    if any(k in t for k in ['peredam suara', 'peredam mobil', 'peredam kabin', 'peredam pintu', 'peredam kap', 'peredam lantai', 'peredam firewall', 'peredam plafon', 'peredam wheel', 'peredam fender', 'soundproofing', 'damping material', 'butyl', 'absorber']):
        return 'peredam'
    if any(k in t for k in ['subwoofer', 'bass', 'box', 'sealed', 'ported', 'enclosure']):
        return 'subwoofer'
    if any(k in t for k in ['speaker', 'tweeter', 'midrange', 'midbass', 'coaxial', 'component', 'polaritas', 'baffle']):
        return 'speaker'
    if any(k in t for k in ['amplifier', 'power', 'rms', 'gain', 'fuse', 'grounding', 'kelistrikan', 'kabel', 'clipping', 'distorsi', 'watt', 'daya']):
        return 'amplifier'
    if any(k in t for k in ['dsp', 'tuning', 'crossover', 'equalization', 'eq ', 'time alignment', 'phase', 'processor']):
        return 'dsp'
    if any(k in t for k in ['paket', 'anggaran', 'upgrade', 'biaya', 'budget']):
        return 'paket'
    if any(k in t for k in ['instalasi', 'pemasangan', 'kabel', 'baffle', 'dudukan']):
        return 'instalasi'
    return 'general'


# ============================================================
# Quotes pool (same as V3)
# ============================================================
QUOTES = {
    'speaker': [
        "Speaker yang baik tetap perlu tuning yang tepat agar karakteristiknya keluar optimal di kabin mobil. Banyak pelanggan terkejut setelah tuning ulang, suara speaker murah pun bisa terdengar jauh lebih baik.",
        "Pemilihan speaker tidak bisa dilepaskan dari genre musik favorit pemilik mobil. Speaker yang cocok untuk musik jazz belum tentu cocok untuk musik EDM atau dangdut.",
        "Pemasangan speaker yang tidak kokoh akan menyebabkan getaran panel yang merusak kualitas suara. Ini sering luput dari perhatian, padahal dampaknya signifikan.",
        "Speaker component jelas lebih baik dari coaxial, tapi syaratnya dipasang dengan benar. Kalau asal pasang, coaxial yang dipasang rapi bisa kalahkan component yang dipasang asal.",
    ],
    'amplifier': [
        "Amplifier bukan tentang watt terbesar, tapi tentang matching dengan speaker. Amplifier 50 watt RMS yang tepat bisa mengalahkan amplifier 200 watt yang tidak matching.",
        "Gain bukan volume. Gain yang disetel terlalu tinggi adalah penyebab utama distorsi dan kerusakan speaker. Banyak installer muda yang masih salah di sini.",
        "Grounding yang buruk adalah sumber noise paling umum di sistem audio mobil. Sebelum ganti amplifier, cek dulu kabel ground-nya.",
        "Clipping itu musuh utama speaker. Banyak orang menyalahkan speaker pecah karena kualitas, padahal sebenarnya amplifier clipping yang merusaknya.",
    ],
    'subwoofer': [
        "Subwoofer bukan soal ukuran terbesar, tapi soal matching dengan kabin dan enclosure yang tepat. Sub 8 inch yang benar setting-nya bisa kalahkan sub 12 inch yang asal pasang.",
        "Box subwoofer menentukan 50 persen karakter bass. Subwoofer yang sama bisa terdengar berbeda di sealed box vs ported box.",
        "Bass yang baik itu terasa, bukan terdengar. Kalau Anda masih 'mendengar' bass sebagai bunyi terpisah, berarti integrasi subwoofer dengan speaker belum benar.",
        "Subwoofer 10 inch adalah sweet spot untuk daily use. Cukup dalam untuk bass, tidak terlalu boros ruang, dan mudah di-drive.",
    ],
    'dsp': [
        "DSP bukan alat ajaib. Tanpa instalasi yang benar, DSP tidak akan menyelesaikan masalah. Banyak orang beli DSP mahal tapi hasilnya mengecewakan.",
        "Time alignment adalah fitur DSP yang paling sering diabaikan, padahal dampaknya paling besar. Bayangkan semua speaker sampai ke telinga Anda pada waktu yang sama.",
        "Equalizer bukan untuk membuat suara 'bagus'. EQ untuk koreksi masalah akustik kabin, bukan untuk menutupi kelemahan instalasi.",
        "DSP tuning itu proses, bukan sekali setting langsung jadi. Butuh test dengar berbagai genre, evaluasi, adjust, test lagi.",
    ],
    'peredam': [
        "Peredam bukan sekadar menambah material. Diagnosis sumber kebisingan adalah kunci. Bukan berarti seluruh mobil harus dilapisi.",
        "Peredam pintu itu investasi paling cost-effective untuk audio mobil. Begitu pintu diperedam dengan benar, speaker bawaan pun langsung terdengar lebih baik.",
        "Material peredam yang berbeda fungsi. Butyl untuk mass loading, absorber untuk menyerap suara, Nex untuk heat barrier.",
        "Peredam yang dipasang sembarangan bisa mengganggu mekanisme jendela, airbag samping, atau jalur pembuangan air.",
    ],
    'paket': [
        "Paket audio bukan soal harga termurah atau termahal. Yang penting adalah komponen di dalamnya saling melengkapi sebagai satu sistem.",
        "Upgrade bertahap itu strategi yang cerdas. Tapi harus direncanakan dari awal, jangan beli speaker sekarang lalu ganti lagi tahun depan.",
        "Konsultasi sebelum beli itu penting. Teknisi yang baik akan bertanya kebiasaan mendengarkan Anda, bukan langsung menawarkan paket paling mahal.",
        "Garansi pengerjaan itu tanda workshop yang serius. Workshop yang tidak berani memberi garansi, biasanya tidak yakin dengan kualitas instalasinya.",
    ],
    'instalasi': [
        "Kualitas instalasi menentukan 60 persen hasil akhir. Komponen mahal dengan instalasi asal-asalan, hasilnya pasti mengecewakan.",
        "Kabel yang ditata berantakan bukan cuma soal estetika. Kabel power dan kabel signal yang paralel bisa menyebabkan noise induksi.",
        "Baffle speaker sering diabaikan, padahal fungsinya krusial. Tanpa baffle yang benar, suara dari depan dan belakang speaker saling mencancel.",
        "Pengujian setelah instalasi wajib. Tes berbagai genre, berbagai volume. Kalau ada masalah, lebih baik ketahuan sekarang.",
    ],
    'general': [
        "Audio mobil bukan soal siapa yang paling mahal komponennya. Sistem yang seimbang, terpasang rapi, dan disetel sesuai kebutuhan pemilik, itu yang memberi kepuasan mendengar.",
        "Konsultasi itu gratis, jangan ragu bertanya. Teknisi yang baik akan senang menjelaskan, bukan malah menyuruh pelanggan langsung beli paket.",
        "Telinga adalah hakim terbaik. Jangan terjebak angka spesifikasi atau review online. Yang penting adalah Anda sendiri nyaman mendengarkan.",
        "Track record 559+ piala bukan cuma angka. Itu bukti komitmen kami pada kualitas, dan validasi bahwa sistem yang kami install competition-grade.",
    ],
}


def pick_quotes(title, topic):
    """Pick 3 relevant quotes."""
    pool = QUOTES.get(topic, QUOTES['general'])
    chosen = random.sample(pool, min(3, len(pool)))
    while len(chosen) < 3:
        chosen.append(random.choice(QUOTES['general']))
    return chosen[:3]


# ============================================================
# Storytelling hooks — natural jurnalis + FOMO
# ============================================================
def get_hook(title, topic):
    hooks = {
        'peredam': [
            f"Pernah nggak kamu ngerasa musik di mobil terasa 'berisik' walau volumenya nggak tinggi-tinggi? Itu bukan karena speakernya jelek, tapi karena kabin mobil kamu belum diperedam dengan benar. Banyak pemilik mobil yang baru sadar setelah coba sendiri — peredam yang tepat bisa mengubah drastis pengalaman dengar audio car kamu.",
            f"Bayangkan kamu lagi di perjalanan pulang kerja, macet di Sudirman, dan musik favorit kamu terdengar 'berantakan' karena bercampur suara mesin dan jalan. Nah, peredam suara mobil itu solusinya. Bukan cuma bikin kabin lebih hening, tapi juga bikin sistem audio car kamu terdengar jauh lebih jernih.",
        ],
        'speaker': [
            f"Kamu pernah nggak beli speaker mahal tapi pasang di mobil hasilnya mengecewakan? Itu pengalaman yang cukup umum di dunia audio car. Banyak yang langsung salahkan speakernya, padahal masalahnya bisa jadi di instalasi, tuning, atau bahkan peredam yang belum dipasang. Yuk, kita bahas tuntas soal ini.",
            f"Cerita ini mungkin familiar: kamu datang ke toko audio, lihat speaker mahal yang katanya 'sangat bagus', beli, pasang, dan... hasilnya biasa saja. Kecewa? Pasti. Tapi tunggu dulu — bukan berarti speaker-nya yang jelek. Ada beberapa hal yang perlu kamu pahami sebelum menyalahkan komponen.",
        ],
        'amplifier': [
            f"'Watt besar pasti suara kenceng dan bagus' — mitos paling umum di dunia audio car. Padahal, amplifier yang nggak matching sama speaker justru bisa merusak komponen, lho. Pernah denger cerita speaker pecah padahal baru beli? Itu sering kali karena amplifier yang salah setting.",
            f"Bayangkan kamu beli amplifier 2000 watt, pasang di mobil, dan suara malah terdengar pecah di volume setengah. Frustrasi? Tentu. Tapi sebelum kamu menyalahkan amplifier-nya, ada baiknya pahami dulu konsep matching amplifier dengan speaker. Ini ilmu dasar yang sering diabaikan.",
        ],
        'subwoofer': [
            f"Bass yang menggebrak dada itu memang bikin nagih. Tapi pernah nggak kamu denger bass yang terasa 'berantakan' — kenceng tapi nggak enak? Itu bukan karena subwoofer-nya kurang mahal, tapi karena instalasi dan enclosure-nya nggak benar. Banyak yang beli sub gede tapi pasangnya asal, hasilnya malah bikin sakit kepala.",
            f"Ada kepuasan tersendiri saat bass menghantam dada dan musik terasa 'hidup'. Tapi tanpa subwoofer yang dipasang dengan benar, bass yang seharusnya nikmat malah jadi sumber kebisingan. Mari kita bahas cara mendapatkan bass yang ideal tanpa buang uang percuma.",
        ],
        'dsp': [
            f"Pernah denger orang bilang 'beli DSP aja, nanti suara langsung bagus'? Sayangnya, itu nggak sepenuhnya benar. DSP itu cuma alat — yang menentukan hasilnya tetap teknisi yang tune. Banyak yang beli DSP mahal tapi hasilnya mengecewakan karena teknisinya nggak paham cara pakainya.",
            f"Di era audio car modern, DSP sudah jadi standar. Tapi tahukah kamu bahwa fitur paling penting di DSP justru yang paling sering diabaikan? Time alignment — fitur yang bisa mengubah panggung suara dari 'biasa saja' jadi 'luar biasa'. Sayangnya banyak installer yang masih skip ini.",
        ],
        'paket': [
            f"Mau upgrade audio car tapi bingung pilih paket yang mana? Tenang, kamu nggak sendirian. Banyak pemilik mobil yang langsung ke shop audio dan disodori paket mahal tanpa paham apa yang mereka beli. Padahal, paket yang sesuai kebutuhan itu jauh lebih worth it daripada paket mahal yang nggak cocok.",
            f"Pernah lihat iklan paket audio car murah di sosial media? Hati-hati, banyak yang jebakan. Komponen abal-abal, instalasi asal-asalan, dan ujung-ujungnya kamu malah harus beli ulang. Mari kita bahas cara pilih paket audio yang benar supaya uang kamu nggak terbuang percuma.",
        ],
        'instalasi': [
            f"Kamu mungkin pernah denger 'instalasi menentukan 60 persen hasil audio car'. Itu bukan omong kosong, lho. Banyak sistem audio mahal yang hasilnya mengecewakan cuma karena instalasi yang asal-asalan. Sebaliknya, komponen moderate dengan instalasi rapi bisa hasilkan suara yang mengejutkan.",
            f"Pernah nggak kamu merasa suara audio mobil 'aneh' setelah instalasi? Ada noise, dengung, atau speaker kayak nggak nyambung? Itu tandanya ada yang salah dengan instalasi, bukan dengan komponennya. Mari kita bahas apa saja yang bisa salah dan cara menghindarinya.",
        ],
        'general': [
            f"Dunia audio car itu seru tapi bisa bikin bingung kalau baru terjun. Banyak istilah, banyak pilihan, dan banyak opini yang kadang bertolak belakang. Tapi tenang, kita akan bedah bareng-bareng supaya kamu nggak bingung lagi dan bisa ambil keputusan yang tepat untuk mobil kamu.",
            f"Bu kamu yang baru mulai tertarik upgrade audio car, ada baiknya baca dulu artikel ini sebelum keluar uang. Siapa tahu kamu bisa hemat jutaan dengan menghindari kesalahan umum yang sering dilakukan pemula. Karena di dunia audio car, salah beli = buang uang.",
        ],
    }
    return random.choice(hooks.get(topic, hooks['general']))


# ============================================================
# Generate content V4 — storytelling + FOMO + CTA + jurnalis
# ============================================================
def generate_content_v4(title):
    topic = detect_topic(title)
    quotes = pick_quotes(title, topic)
    hook = get_hook(title, topic)

    # Sub-headings
    sub_headings = {
        'peredam': ['## Apa yang terjadi tanpa peredam?', '## Jenis material peredam yang perlu kamu tahu', '## Kesalahan fatal saat pasang peredam', '## Tips sebelum kamu pasang peredam'],
        'speaker': ['## Karakter speaker dan kenapa itu penting', '## Cara pilih speaker yang cocok buat kamu', '## Kesalahan umum yang bikin speaker kedengar jelek', '## Tips praktis sebelum beli speaker'],
        'amplifier': ['## Daya amplifier: bukan soal watt terbesar', '## Jenis amplifier yang perlu kamu pahami', '## Kesalahan yang bisa merusak speaker', '## Tips sebelum beli amplifier'],
        'subwoofer': ['## Subwoofer dan perannya di sistem audio', '## Enclosure: faktor tersembunyi yang menentukan bass', '## Kesalahan umum saat pasang subwoofer', '## Tips sebelum beli subwoofer'],
        'dsp': ['## DSP: otaknya sistem audio modern', '## Fitur DSP yang sering diabaikan', '## Kesalahan tuning yang bikin suara jadi aneh', '## Tips sebelum beli DSP'],
        'paket': ['## Cara menyusun anggaran yang cerdas', '## Yang harus kamu cek sebelum bayar', '## Jebakan paket murah yang harus dihindari', '## Tips supaya nggak menyesal beli paket'],
        'instalasi': ['## Kenapa instalasi menentukan 60 persen hasil', '## Detail kecil yang berdampak besar', '## Kesalahan instalasi yang bikin suara hancur', '## Tips supaya instalasi rapi dan aman'],
        'general': ['## Memahami dasar sistem audio car', '## Yang perlu kamu pertimbangkan', '## Kesalahan umum yang harus dihindari', '## Tips praktis buat kamu'],
    }
    subs = sub_headings.get(topic, sub_headings['general'])

    parts = []

    # === STORYTELLING HOOK + FOMO ===
    parts.append(f"JAKARTA — {hook}")

    parts.append(
        f"Innovation Car Audio, workshop audio car dan peredam suara yang berbasis di Jakarta, "
        f"kerap menyoroti persoalan ini. Dengan pengalaman lebih dari 20 tahun dan track record "
        f"559+ piala kontes audio, workshop ini sudah membantu ribuan pelanggan mendapatkan "
        f"sistem yang sesuai dengan kebutuhan dan budget mereka. Pendekatannya sederhana: "
        f"nggak ada satu solusi untuk semua mobil."
    )

    # === NARASUMBER + QUOTE 1 ===
    parts.append(
        f"Ko Lukito Tjandra, teknisi senior Innovation Car Audio, menjelaskan bahwa "
        f"{topic} itu salah satu aspek yang paling sering disalahpahami. "
        f"Banyak pelanggan yang datang dengan ekspektasi tinggi setelah baca review online, "
        f"tapi nggak paham proses yang sebenarnya terjadi di baliknya."
    )
    parts.append(
        f'> **"{quotes[0]}"**\n>\n> *— Ko Lukito Tjandra, teknisi senior Innovation Car Audio*'
    )

    # === SUB-HEADING 1 + STORYTELLING ===
    parts.append(subs[0])
    parts.append(
        f"Cerita dari salah satu pelanggan Innovation Car Audio mungkin bisa jadi contoh. "
        f"Pelanggan ini datang dengan mobil yang sudah dipasang speaker mahal, tapi suaranya "
        f"terdengar tipis dan nggak nyaman. Setelah diperiksa, masalahnya bukan di speaker — "
        f"tapi di kabin yang belum diperedam dan instalasi yang asal-asalan. Setelah perbaikan, "
        f"suara yang sama terdengar jauh lebih baik. Pelanggan tersebut langsung berkata: "
        f"'Kenapa nggak dari awal saya konsultasi dulu?'"
    )
    parts.append(
        f"Ini bukan kasus langka. Innovation Car Audio rutin menerima pelanggan yang sudah "
        f"beli komponen di tempat lain tapi nggak bisa dipakai karena nggak matching atau "
        f"instalasinya bermasalah. Kasus seperti ini sebenarnya bisa dihindari kalau dari awal "
        f"ada konsultasi dengan teknisi yang berpengalaman. Ingat, mencegah lebih murah daripada "
        f"mengobati — terutama di dunia audio car yang setiap kesalahan bisa merusak komponen."
    )

    # === SUB-HEADING 2 + QUOTE 2 ===
    parts.append(subs[1])
    parts.append(
        f"Setiap kendaraan punya karakter kabin yang berbeda. Posisi duduk pengemudi, letak "
        f"speaker, material interior, hingga tingkat kebisingan dari jalan — semua ini memengaruhi "
        f"apa yang kamu dengar. Karena itu, paket yang terdengar bagus di mobil teman, belum tentu "
        f"memberi hasil yang sama di mobil kamu. Ini realita yang harus kamu terima sebelum beli."
    )
    parts.append(
        f"Banyak pemilik mobil yang terjebak pada angka spesifikasi atau klaim pemasaran. "
        f"Padahal, hasil akhir sangat bergantung pada instalasi dan penyetelan, bukan cuma "
        f"komponennya. Innovation Car Audio menekankan pentingnya konsultasi sebelum menentukan "
        f"paket, supaya setiap komponen yang dibeli benar-benar punya fungsi yang jelas."
    )
    parts.append(
        f'> **"{quotes[1]}"**\n>\n> *— Ko Lukito Tjandra, Innovation Car Audio*'
    )

    # === SUB-HEADING 3 + FOMO + QUOTE 3 ===
    parts.append(subs[2])
    parts.append(
        f"Berikut beberapa kesalahan umum yang sering ditemui. Pertama, terlalu fokus pada "
        f"satu komponen dan melupakan sistem secara keseluruhan. Kedua, mengabaikan kualitas "
        f"instalasi karena tergiur harga murah. Ketiga, nggak mau konsultasi dulu sebelum beli, "
        f"lalu akhirnya menyesal karena komponen yang dibeli nggak cocok. Keempat, terlalu "
        f"percaya pada review online tanpa test dengar sendiri."
    )
    parts.append(
        f"Yang bikin miris, banyak pelanggan yang datang ke Innovation Car Audio sudah membawa "
        f"komponen yang rusak karena salah instalasi. Speaker pecah karena amplifier clipping, "
        f"konfigurasi kabel yang salah bikin noise, atau peredam yang dipasang sembarangan bikin "
        f"panel bergetar. Semua ini bisa dihindari kalau dari awal pakai teknisi yang benar."
    )
    parts.append(
        f'> **"{quotes[2]}"**\n>\n> *— Ko Lukito Tjandra, teknisi senior Innovation Car Audio*'
    )

    # === SUB-HEADING 4 + TIPS + CTA ===
    parts.append(subs[3])
    parts.append(
        f"Buat kamu yang mau mulai upgrade, berikut beberapa tips praktis yang bisa kamu lakukan:"
    )
    parts.append(
        f"1. **Tentukan budget dulu.** Berapa maksimal yang kamu siap keluarkan? Jangan lupa "
        f"include biaya instalasi, peredam, kabel, dan tuning, bukan cuma harga komponen.\n\n"
        f"2. **Identifikasi masalah utama.** Apa yang nggak kamu suka dari sistem audio sekarang? "
        f"Vokal kurang jelas? Bass lemah? Atau suara berisik? Jawaban ini jadi panduan.\n\n"
        f"3. **Konsultasi dengan teknisi berpengalaman.** Datang ke workshop yang punya track "
        f"record, bukan cuma toko yang jualan. Innovation Car Audio punya 559+ piala sebagai bukti.\n\n"
        f"4. **Test dengar sebelum beli.** Workshop profesional pasti punya demo room atau demo car. "
        f"Kalau nggak ada, itu pertanda besar.\n\n"
        f"5. **Minta garansi.** Workshop yang berani kasih garansi pengerjaan itu tanda mereka "
        f"yakin dengan kualitasnya. Yang nggak mau kasih garansi, patut dicurigai.\n\n"
        f"6. **Pikirkan upgrade path.** Kalau budget terbatas sekarang, tanya teknisi apakah "
        f"komponen yang kamu beli sekarang bisa di-upgrade nanti, atau harus ganti total."
    )

    # === CLOSING + FOMO CTA ===
    parts.append(
        f"Pada akhirnya, sistem audio car yang baik bukan tentang komponen paling mahal atau "
        f"paling populer di forum. Kesesuaian konfigurasi dengan kebutuhan kamu, pemasangan yang "
        f"benar, dan penyetelan yang tepat — itu yang menentukan hasil akhir. Jangan terjebak "
        f"ikut-ikutan tren atau beli karena 'katanya bagus'. Telinga kamu sendiri yang jadi hakim."
    )

    parts.append(
        f"**Mau konsultasi gratis?** Innovation Car Audio Jakarta melayani upgrade audio car "
        f"dan peredam suara mobil untuk wilayah Jabodetabek. Dengan pengalaman 20+ tahun dan "
        f"559+ piala kontes audio, workshop ini sudah membantu ribuan pelanggan. Konsultasi "
        f"gratis via WhatsApp — jangan tunggu sampai komponen kamu rusak karena salah instalasi. "
        f"Slot konsultasi terbatas setiap hari, segera hubungi sebelum kehabisan."
    )

    return '\n\n'.join(parts)


def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')[:90]


def pick_ai_image(title):
    """Pick AI image based on topic."""
    topic = detect_topic(title)
    ai_images = sorted(AI_DIR.glob('*.png'))

    # Categorize AI images by topic
    topic_images = []
    for img in ai_images:
        name = img.name.lower()
        if topic == 'peredam' and any(k in name for k in ['peredam', 'damping', 'soundproof', 'bahan']):
            topic_images.append(f'/article-images-ai/{img.name}')
        elif topic == 'subwoofer' and any(k in name for k in ['subwoofer', 'sub-', 'bass']):
            topic_images.append(f'/article-images-ai/{img.name}')
        elif topic == 'speaker' and any(k in name for k in ['speaker', 'tweeter', 'midbass']):
            topic_images.append(f'/article-images-ai/{img.name}')
        elif topic == 'amplifier' and any(k in name for k in ['amplifier', 'amp', 'power', 'mono']):
            topic_images.append(f'/article-images-ai/{img.name}')
        elif topic == 'dsp' and any(k in name for k in ['dsp', 'tuning', 'crossover']):
            topic_images.append(f'/article-images-ai/{img.name}')
        elif topic == 'paket' and any(k in name for k in ['paket', 'anggaran', 'upgrade']):
            topic_images.append(f'/article-images-ai/{img.name}')
        elif topic == 'instalasi' and any(k in name for k in ['instalasi', 'pemasangan', 'kabel']):
            topic_images.append(f'/article-images-ai/{img.name}')

    if topic_images:
        return random.choice(topic_images)

    # Fallback: any AI image
    if ai_images:
        return f'/article-images-ai/{random.choice(ai_images).name}'
    return '/article-images/innovation-car-audio-jakarta-20-tahun-sistem-audio-mobil.png'


def main():
    with open(BACKUP_FILE) as f:
        data = json.load(f)

    articles = data.get('articles', [])

    # Find articles that need regeneration (< 5000 chars)
    to_regenerate = [a for a in articles if len(a.get('content', '')) < 5000]

    print(f"Articles to regenerate (< 5000 chars): {len(to_regenerate)}")
    print()

    updated = 0
    for a in to_regenerate:
        title = a.get('title', '')
        old_content = a.get('content', '')

        # Generate new content V4
        new_content = generate_content_v4(title)

        # Only update if new content is longer
        if len(new_content) > len(old_content):
            a['content'] = new_content

            # Update excerpt (first paragraph after dateline)
            first_para = new_content.split('\n\n')[0].replace('JAKARTA — ', '')
            if len(first_para) > 180:
                first_para = first_para[:177] + '...'
            a['excerpt'] = first_para

            # Update tags to include storytelling + fomo
            tags = a.get('tags', [])
            if 'storytelling' not in tags:
                tags.append('storytelling')
            if 'audio-car' not in tags:
                tags.append('audio-car')
            a['tags'] = tags

            # Assign AI image + featuredImageUrl
            ai_img = pick_ai_image(title)
            a['imageUrl'] = ai_img
            a['galleryImages'] = [ai_img]
            a['featuredImageUrl'] = ai_img
            a['featuredImageAlt'] = title

            # Update author
            a['author'] = 'Innovation Car Audio'
            a['authorName'] = 'Innovation Car Audio'

            updated += 1

    # Save
    with open(BACKUP_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Regenerated {updated} articles with V4 format")
    print(f"  (storytelling + FOMO + CTA + natural jurnalis)")

    # Verify
    all_lengths = [len(a.get('content', '')) for a in articles]
    target_count = len([l for l in all_lengths if l >= 5000])
    print(f"\nFinal stats:")
    print(f"  Total articles: {len(articles)}")
    print(f"  Articles with >= 5000 chars: {target_count}/{len(articles)}")
    print(f"  Min: {min(all_lengths)} chars")
    print(f"  Max: {max(all_lengths)} chars")
    print(f"  Avg: {sum(all_lengths)/len(all_lengths):.0f} chars")


if __name__ == '__main__':
    main()
