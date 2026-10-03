/**
 * generate-21-article-images.ts
 *
 * Generate 21 AI images untuk artikel audio car.
 * Setiap gambar relevan dengan konten artikel:
 *  - Review speaker → close-up speaker
 *  - Review subwoofer → close-up subwoofer
 *  - Tips/edukasi → installation/lifestyle
 *  - Profil workshop → showroom front
 *
 * Style: Professional automotive photography
 * Size: 1344x768 (landscape 16:9)
 */

import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/download/article-images'
const SIZE = '1344x768' as const

interface ArticleImage {
  slug: string
  prompt: string
}

const STYLE = 'professional automotive photography, high-end car audio, premium quality, sharp focus, detailed, photorealistic, studio lighting, dark luxury background, 8k quality'

const ARTICLES: ArticleImage[] = [
  {
    slug: 'perbedaan-speaker-2-way-dan-3-way-audio-mobil',
    prompt: `Professional comparison display of 2-way and 3-way car speaker systems side by side. Left side shows 2-way speaker (tweeter + midbass 6.5 inch), right side shows 3-way speaker (tweeter + midrange + midbass). Components arranged on premium dark display surface with labels. ${STYLE}`,
  },
  {
    slug: 'review-speaker-gz-mercy-gzcs-100-2-mb-2-way-4-inch',
    prompt: `Close-up product photography of GZ Mercy GZCS 100.2 MB 2 Way 4 inch car speaker with Jaring CNC Midrange grille. Premium speaker on dark studio surface, showing the CNC machined grille detail and tweeter. ${STYLE}`,
  },
  {
    slug: 'panduan-lengkap-dsp-rainbow-el-pa4-6-tuning-audio-mobil',
    prompt: `Close-up product photography of Rainbow DSP EL-PA4.6 audio processor with controller unit. Showing the knobs, ports, and display. DSP on premium dark surface with subtle blue ambient lighting. ${STYLE}`,
  },
  {
    slug: 'review-blam-relax-165-rx-speaker-2-way-6-5-inch',
    prompt: `Close-up product photography of Blam Relax 165 RX 2 Way 6.5 inch car speaker. Premium speaker with tweeter and midbass on dark studio surface with warm amber gold accent lighting. ${STYLE}`,
  },
  {
    slug: 'subwoofer-bawah-jok-vs-bagasi-perbandingan',
    prompt: `Split comparison image: left side shows 8 inch subwoofer installed under car seat (compact), right side shows 10 inch subwoofer in trunk with custom box. Both in luxury car interior, professional automotive photography. ${STYLE}`,
  },
  {
    slug: 'review-rainbow-experience-line-el-c6-2-speaker-daily',
    prompt: `Close-up product photography of Rainbow Experience Line EL-C6.2 2 Way 6.5 inch car speaker. Premium speaker with tweeter and midbass on dark studio surface with subtle blue accent lighting. ${STYLE}`,
  },
  {
    slug: 'review-infinity-alpha-650c-speaker-entry-level',
    prompt: `Close-up product photography of Infinity Alpha 650C 2 Way 6.5 inch car speaker. Entry-level aftermarket speaker on dark studio surface with cool gray accent lighting. ${STYLE}`,
  },
  {
    slug: 'review-power-mono-prototype-quarto-amplifier-subwoofer',
    prompt: `Close-up product photography of Power Mono Prototype Quarto mono block amplifier. Premium amplifier with heatsink fins on dark studio surface, showing power terminals and controls. ${STYLE}`,
  },
  {
    slug: 'panduan-memilih-paket-audio-mobil-simple-entry-daily-ahe',
    prompt: `Professional car audio showroom display with 4 tiers of audio packages. From entry-level to premium, showing speakers, DSP, amplifiers, and subwoofers arranged in 4 rows. Dark luxury showroom background. ${STYLE}`,
  },
  {
    slug: 'peredam-gran-turismo-wajib-paket-audio-mobil',
    prompt: `Close-up of Peredam Gran Turismo sound deadening material sheets being applied to car door panel. Butyl material on dark door panel, showing installation process in professional workshop. ${STYLE}`,
  },
  {
    slug: 'tips-instalasi-audio-mobil-sebelum-upgrade',
    prompt: `Professional car audio installation in progress. Technician hands installing speaker in car door with DSP processor and amplifier visible. Clean workshop environment with tools. ${STYLE}`,
  },
  {
    slug: 'review-gz-radioactive-speaker-aktif-affordable-high-end',
    prompt: `Close-up product photography of GZ RadioActive GZRT 25 SQ tweeter and GZRK 165 SQ midbass 2 Way active speaker system. Premium components on dark studio surface with emerald green accent lighting. ${STYLE}`,
  },
  {
    slug: 'subwoofer-quarto-10-vs-cresscendo-10-perbandingan',
    prompt: `Split comparison of two 10 inch subwoofers side by side. Left shows Prototype Quarto 10 inch subwoofer, right shows Cresscendo 10 inch subwoofer. Both on dark premium surface with dramatic lighting. ${STYLE}`,
  },
  {
    slug: 'review-phd-mf-6-1-kit-speaker-french-audio',
    prompt: `Close-up product photography of PHD MF 6.1 KIT 2 Way 6.5 inch car speaker from France. Premium speaker with tweeter and midbass on dark studio surface with subtle warm lighting. ${STYLE}`,
  },
  {
    slug: 'review-morel-maximo-6-speaker-israel-affordable-high-end',
    prompt: `Close-up product photography of Morel Maximo 6 2 Way 6.5 inch car speaker from Israel. Premium speaker with tweeter and midbass on dark studio surface with warm natural lighting. ${STYLE}`,
  },
  {
    slug: 'konfigurasi-dsp-6ch-8ch-10ch-mana-yang-dibutuhkan',
    prompt: `Professional display of 3 DSP configurations: 6 channel, 8 channel, and 10 channel audio processors arranged in 3 rows. Rainbow DSP EL-PA4.6 units with different channel configurations shown. ${STYLE}`,
  },
  {
    slug: 'cara-merawat-sistem-audio-mobil-awet-optimal',
    prompt: `Car audio maintenance scene. Clean car interior with premium audio system visible, technician hand carefully cleaning speaker grille with microfiber cloth. Well-maintained luxury vehicle interior. ${STYLE}`,
  },
  {
    slug: 'review-zevox-zv-8-sas-subwoofer-compact-bawah-jok',
    prompt: `Close-up of Zevox ZV 8 SAS 8 inch subwoofer installed under car seat. Compact subwoofer in custom box under passenger seat, showing the clean installation in luxury car interior. ${STYLE}`,
  },
  {
    slug: 'review-subwoofer-phd-8-inch-premium-bawah-jok-bagasi',
    prompt: `Close-up product photography of PHD 8 inch subwoofer in custom box for car trunk. Premium French subwoofer on dark studio surface with warm lighting, showing cone detail. ${STYLE}`,
  },
  {
    slug: 'jaring-cnc-midrange-detail-premium-instalasi-audio',
    prompt: `Extreme close-up of Jaring CNC Midrange grille on GZ Mercy speaker. Showing precision CNC machined pattern, premium metal grille with intricate design, dark background with emerald green accent. ${STYLE}`,
  },
  {
    slug: 'innovation-car-audio-jakarta-20-tahun-sistem-audio-mobil',
    prompt: `Professional car audio workshop showroom front. Innovation Car Audio Jakarta workshop exterior with luxury cars parked, premium audio display visible through glass window. Professional automotive business photography. ${STYLE}`,
  },
]

async function generateOne(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  prompt: string,
  outputPath: string,
  retries = 3,
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await zai.images.generations.create({ prompt, size: SIZE })
      const base64 = response?.data?.[0]?.base64
      if (!base64) throw new Error('No image data returned')
      const buffer = Buffer.from(base64, 'base64')
      fs.writeFileSync(outputPath, buffer)
      return { success: true }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`    ✗ Attempt ${attempt}/${retries}: ${errMsg.slice(0, 80)}`)
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * attempt))
      } else {
        return { success: false, error: errMsg }
      }
    }
  }
  return { success: false, error: 'Unknown' }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log('=== 21 Article Image Generator ===')
  console.log(`Output: ${OUTPUT_DIR}`)
  console.log(`Total: ${ARTICLES.length} images`)

  // Resume: skip existing
  const toGenerate = ARTICLES.filter((a) => {
    const p = path.join(OUTPUT_DIR, `${a.slug}.png`)
    return !fs.existsSync(p) || fs.statSync(p).size < 1000
  })

  console.log(`Already exists: ${ARTICLES.length - toGenerate.length}`)
  console.log(`To generate: ${toGenerate.length}`)
  console.log()

  if (toGenerate.length === 0) {
    console.log('✓ All images already generated!')
    return
  }

  const zai = await ZAI.create()
  let success = 0
  let failed = 0
  const startTime = Date.now()

  for (let i = 0; i < toGenerate.length; i++) {
    const article = toGenerate[i]
    const filename = `${article.slug}.png`
    const fullPath = path.join(OUTPUT_DIR, filename)
    const progress = `[${i + 1}/${toGenerate.length}]`
    const eta = ((Date.now() - startTime) / (i + 1) * (toGenerate.length - i - 1) / 1000 / 60).toFixed(1)

    console.log(`${progress} ${article.slug.slice(0, 50)}... (ETA: ${eta} min)`)

    const result = await generateOne(zai, article.prompt, fullPath)
    if (result.success) {
      success++
      console.log(`    ✓ Saved (${(fs.statSync(fullPath).size / 1024).toFixed(0)} KB)`)
    } else {
      failed++
      console.log(`    ✗ FAILED`)
    }
  }

  console.log()
  console.log('=== Summary ===')
  console.log(`  Success: ${success}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} min`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
