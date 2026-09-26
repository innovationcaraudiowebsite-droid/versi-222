/**
 * generate-product-images.ts
 *
 * Generate 92 product images untuk 23 varian (4 gambar per varian).
 *
 * Strategy:
 *  - Lifestyle/showroom style (in-car installation + dramatic lighting)
 *  - Accent lighting per tier:
 *    - basic       → slate/gray accent
 *    - normal      → blue accent
 *    - best_buy    → amber/gold accent
 *    - recommended → emerald/green accent
 *  - Size: 1344x768 (landscape 16:9)
 *  - High quality (detailed prompt)
 *
 * 4 angle per varian:
 *  - img-1: Main overview (semua komponen dalam 1 shot)
 *  - img-2: Close-up DSP processor + controller
 *  - img-3: Close-up subwoofer + amplifier
 *  - img-4: Installation detail / wiring / in-car context
 *
 * Resume capability: skip files yang sudah ada.
 */

import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/download/product-images'
const SIZE = '1344x768' as const

// ============================================================
// Tier accent colors (sesuai ribbon color di mock data)
// ============================================================
const TIER_ACCENT: Record<string, { color: string; lighting: string }> = {
  basic: {
    color: 'slate gray',
    lighting: 'soft cool gray ambient lighting, neutral professional atmosphere',
  },
  normal: {
    color: 'blue',
    lighting: 'subtle blue ambient lighting, calm professional atmosphere',
  },
  best_buy: {
    color: 'amber gold',
    lighting: 'warm amber gold accent lighting, premium luxurious atmosphere',
  },
  recommended: {
    color: 'emerald green',
    lighting: 'emerald green accent lighting, premium high-end atmosphere',
  },
}

// ============================================================
// Style template (lifestyle/showroom)
// ============================================================
const STYLE_BASE = `professional automotive showroom photography, high-end car audio installation display, premium quality, sharp focus, detailed, photorealistic, 8k quality, automotive enthusiast aesthetic`

// ============================================================
// Helper: build 4 prompt variations per variant
// ============================================================
interface VariantImageSpec {
  slug: string
  tier: string
  productName: string
  variantName: string
  cardTitle: string
  cardDescription: string
}

function buildPrompts(v: VariantImageSpec): Array<{ filename: string; prompt: string }> {
  const accent = TIER_ACCENT[v.tier] || TIER_ACCENT.basic
  const baseName = `${v.slug}`

  // Common subject components
  const subject = v.cardTitle.toLowerCase()
  const productContext = `${v.productName} - ${v.variantName}: ${v.cardDescription}`

  return [
    // Image 1: Main overview - all components together
    {
      filename: `${baseName}-1.png`,
      prompt: `Professional car audio showroom display featuring ${subject}. ${productContext}. Components arranged elegantly on premium display surface, ${accent.lighting}, dark luxury background, ${STYLE_BASE}`,
    },
    // Image 2: Close-up DSP processor + controller
    {
      filename: `${baseName}-2.png`,
      prompt: `Close-up product photography of DSP Rainbow EL-PA4.6 audio processor with controller unit, premium car audio component, ${accent.lighting}, dark elegant background, macro detail showing knobs and ports, ${STYLE_BASE}`,
    },
    // Image 3: Close-up subwoofer + amplifier
    {
      filename: `${baseName}-3.png`,
      prompt: `Close-up product photography of car audio subwoofer with mono block amplifier, premium audio equipment, ${accent.lighting}, dark luxury background, detailed cone and heatsink, ${STYLE_BASE}`,
    },
    // Image 4: In-car installation context
    {
      filename: `${baseName}-4.png`,
      prompt: `Car audio installation in luxury vehicle interior, ${subject} professionally installed, premium car cabin with custom audio system, ${accent.lighting}, automotive lifestyle photography, ${STYLE_BASE}`,
    },
  ]
}

// ============================================================
// All 23 variants spec
// ============================================================
const VARIANTS: VariantImageSpec[] = [
  // === Product 1: Simple Upgrade (4 varian) ===
  { slug: 'simple-upgrade-basic', tier: 'basic', productName: 'Simple Upgrade', variantName: 'Basic', cardTitle: 'DSP + POWER ONLY', cardDescription: 'Upgrade dasar dengan DSP Rainbow + Power 4ch. Speaker original tetap dipakai.' },
  { slug: 'simple-upgrade-normal', tier: 'normal', productName: 'Simple Upgrade', variantName: 'Normal', cardTitle: 'DSP + POWER + SUB 8"', cardDescription: 'Tambah subwoofer 8" untuk bass lebih dalam. Speaker original + DSP + Power + Sub.' },
  { slug: 'simple-upgrade-best-buy', tier: 'best_buy', productName: 'Simple Upgrade', variantName: 'Best Buy', cardTitle: 'DSP + CONTROLLER + SUB 10"', cardDescription: 'Paket lengkap dengan DSP Controller + Power Mono + Sub 10" Prototype Quarto.' },
  { slug: 'simple-upgrade-recommended', tier: 'recommended', productName: 'Simple Upgrade', variantName: 'Recommended', cardTitle: 'SPEAKER ORIGINAL + DSP + POWER + SUB 10"', cardDescription: 'Speaker original + DSP Rainbow Controller + Power Mono + Sub 10" + Peredam Gran Turismo.' },

  // === Product 2: 2 Way Upgrade Audio (3 varian) ===
  { slug: '2-way-upgrade-audio-basic', tier: 'basic', productName: '2 Way Upgrade Audio', variantName: 'Basic', cardTitle: '2 WAY + DSP ONLY', cardDescription: 'Speaker 2 Way aftermarket + DSP Rainbow. Tanpa subwoofer, fokus vocal clarity.' },
  { slug: '2-way-upgrade-audio-normal', tier: 'normal', productName: '2 Way Upgrade Audio', variantName: 'Normal', cardTitle: '2 WAY + DSP + SUB 8" ENTRY', cardDescription: 'Tambah subwoofer 8" entry level untuk bass tambahan. Combo seimbang.' },
  { slug: '2-way-upgrade-audio-recommended', tier: 'recommended', productName: '2 Way Upgrade Audio', variantName: 'Recommended', cardTitle: 'PHD 6.1 + DSP + SUB 8" + CNC', cardDescription: 'PHD MF 6.1 KIT 2 Way + DSP Rainbow + Sub 8" Zevox + Jaring CNC Midrange.' },

  // === Product 3: Full Upgrade Audio (3 varian) ===
  { slug: 'full-upgrade-audio-basic', tier: 'basic', productName: 'Full Upgrade Audio', variantName: 'Basic', cardTitle: 'SPEAKER PREMIUM + DSP', cardDescription: 'Speaker aftermarket entry + DSP Rainbow. Tanpa power tambahan, fokus clarity.' },
  { slug: 'full-upgrade-audio-normal', tier: 'normal', productName: 'Full Upgrade Audio', variantName: 'Normal', cardTitle: 'SPEAKER + DSP + POWER 4CH + SUB 10"', cardDescription: 'Tambah power 4ch + sub 10" untuk sistem lebih lengkap dan bertenaga.' },
  { slug: 'full-upgrade-audio-best-buy', tier: 'best_buy', productName: 'Full Upgrade Audio', variantName: 'Best Buy', cardTitle: 'SPEAKER PREMIUM + DSP + SUB 12"', cardDescription: 'Speaker premium + DSP Rainbow + Power + Sub 12" + install premium.' },

  // === Product 4: Peredam Mobil (3 varian) ===
  { slug: 'peredam-mobil-basic', tier: 'basic', productName: 'Peredam Mobil', variantName: 'Basic', cardTitle: 'PEREDAM 4 PINTU', cardDescription: 'Peredam 4 pintu dengan butyl 2mm + foam absorber. Audio speaker jernih.' },
  { slug: 'peredam-mobil-normal', tier: 'normal', productName: 'Peredam Mobil', variantName: 'Normal', cardTitle: 'PEREDAM 4 PINTU + KAP MESIN', cardDescription: 'Tambah peredam kap mesin untuk mengurangi panas & suara mesin.' },
  { slug: 'peredam-mobil-best-buy', tier: 'best_buy', productName: 'Peredam Mobil', variantName: 'Best Buy', cardTitle: 'FULL KABIN + WHEEL HOUSING + KAP', cardDescription: 'Peredam full kabin + wheel housing + kap mesin. Kabin paling senyap.' },

  // === Product 5: Audio Tuning Service (3 varian) ===
  { slug: 'audio-tuning-service-basic', tier: 'basic', productName: 'Audio Tuning Service', variantName: 'Basic', cardTitle: 'DSP TUNING (1 JAM)', cardDescription: 'Tuning DSP dasar 1 jam. Crossover, level, EQ basic untuk sistem existing.' },
  { slug: 'audio-tuning-service-normal', tier: 'normal', productName: 'Audio Tuning Service', variantName: 'Normal', cardTitle: 'TUNING + RTA MEASUREMENT', cardDescription: 'Tuning lengkap dengan RTA measurement. Time alignment + EQ presisi.' },
  { slug: 'audio-tuning-service-recommended', tier: 'recommended', productName: 'Audio Tuning Service', variantName: 'Recommended', cardTitle: 'FULL TUNING + RTA + FOLLOW-UP', cardDescription: 'Full tuning + RTA + follow-up 1 bulan. Hasil optimal dengan garansi penyesuaian.' },

  // === Product 6: 2 Way Subwoofer Bawah Jok (3 varian) ===
  { slug: '2-way-subwoofer-bawah-jok-basic', tier: 'basic', productName: '2 Way Subwoofer Bawah Jok', variantName: 'Basic', cardTitle: '2-WAY PASSIVE + DSP', cardDescription: 'Speaker 2-way passive + DSP Rainbow. Tanpa subwoofer, fokus vocal clarity.' },
  { slug: '2-way-subwoofer-bawah-jok-normal', tier: 'normal', productName: '2 Way Subwoofer Bawah Jok', variantName: 'Normal', cardTitle: '2-WAY + DSP + SUB 8" ENTRY', cardDescription: 'Tambah subwoofer 8" entry level bawah jok untuk bass lebih dalam.' },
  { slug: '2-way-subwoofer-bawah-jok-best-buy', tier: 'best_buy', productName: '2 Way Subwoofer Bawah Jok', variantName: 'Best Buy', cardTitle: '2-WAY ACTIVE + DSP + SUB BAWAH JOK', cardDescription: 'GZ RadioActive 2-way aktif + DSP Rainbow + Sub 8" Zevox bawah jok + Peredam GT.' },

  // === Product 7: Upgrade Audio Series (4 varian) ===
  { slug: 'upgrade-audio-series-basic', tier: 'basic', productName: 'Upgrade Audio Series', variantName: 'Basic', cardTitle: '2 WAY + DSP + SUB 10" (INFINITY)', cardDescription: 'Speaker Infinity Alpha 650C + DSP Rainbow + Power Mono + Sub 10".' },
  { slug: 'upgrade-audio-series-normal', tier: 'normal', productName: 'Upgrade Audio Series', variantName: 'Normal', cardTitle: '2 WAY + DSP + SUB 10" (RAINBOW EL)', cardDescription: 'Speaker Rainbow Experience Line EL-C6.2 + DSP Rainbow + Power Mono + Sub 10".' },
  { slug: 'upgrade-audio-series-best-buy', tier: 'best_buy', productName: 'Upgrade Audio Series', variantName: 'Best Buy', cardTitle: '2 WAY + DSP + SUB 10" (BLAM RELAX)', cardDescription: 'Speaker Blam Relax 165 RX + DSP Rainbow + Power Mono + Sub 10".' },
  { slug: 'upgrade-audio-series-recommended', tier: 'recommended', productName: 'Upgrade Audio Series', variantName: 'Recommended', cardTitle: '2 WAY 4" + DSP + SUB 10" (GZ MERCY)', cardDescription: 'GZ Mercy GZCS 100.2 MB 2 Way 4" + DSP Rainbow + Power Mono + Sub 10" + Jaring CNC.' },
]

// ============================================================
// Generate function dengan retry
// ============================================================
async function generateOne(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  prompt: string,
  outputPath: string,
  retries = 3,
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt,
        size: SIZE,
      })

      const base64 = response?.data?.[0]?.base64
      if (!base64) {
        throw new Error('No image data returned')
      }

      const buffer = Buffer.from(base64, 'base64')
      fs.writeFileSync(outputPath, buffer)
      return { success: true }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`    ✗ Attempt ${attempt}/${retries} failed: ${errMsg.slice(0, 100)}`)
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * attempt)) // exponential backoff
      } else {
        return { success: false, error: errMsg }
      }
    }
  }
  return { success: false, error: 'Unknown error' }
}

// ============================================================
// Main
// ============================================================
async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log('=== Product Image Generator ===')
  console.log(`Output dir: ${OUTPUT_DIR}`)
  console.log(`Size: ${SIZE}`)
  console.log(`Total variants: ${VARIANTS.length}`)
  console.log(`Total images: ${VARIANTS.length * 4}`)
  console.log()

  // Initialize ZAI SDK
  const zai = await ZAI.create()

  // Build all image specs
  const allImages: Array<{ variantSlug: string; variantName: string; filename: string; prompt: string }> = []
  for (const v of VARIANTS) {
    const prompts = buildPrompts(v)
    for (const p of prompts) {
      allImages.push({
        variantSlug: v.slug,
        variantName: `${v.productName} - ${v.variantName}`,
        filename: p.filename,
        prompt: p.prompt,
      })
    }
  }

  console.log(`Total images to generate: ${allImages.length}`)
  console.log()

  // Resume: skip existing files
  const toGenerate = allImages.filter((img) => {
    const fullPath = path.join(OUTPUT_DIR, img.filename)
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      if (stats.size > 1000) {
        // File exists and has content, skip
        return false
      }
    }
    return true
  })

  console.log(`Already exists: ${allImages.length - toGenerate.length}`)
  console.log(`To generate: ${toGenerate.length}`)
  console.log()

  if (toGenerate.length === 0) {
    console.log('✓ All images already generated!')
    return
  }

  // Generate sequentially
  let success = 0
  let failed = 0
  const failedList: string[] = []
  const startTime = Date.now()

  for (let i = 0; i < toGenerate.length; i++) {
    const img = toGenerate[i]
    const fullPath = path.join(OUTPUT_DIR, img.filename)
    const progress = `[${i + 1}/${toGenerate.length}]`
    const eta = ((Date.now() - startTime) / (i + 1) * (toGenerate.length - i - 1) / 1000 / 60).toFixed(1)
    console.log(`${progress} ${img.variantName} → ${img.filename} (ETA: ${eta} min)`)

    const result = await generateOne(zai, img.prompt, fullPath)
    if (result.success) {
      success++
      console.log(`    ✓ Saved (${(fs.statSync(fullPath).size / 1024).toFixed(0)} KB)`)
    } else {
      failed++
      failedList.push(`${img.filename}: ${result.error}`)
      console.log(`    ✗ FAILED`)
    }
  }

  console.log()
  console.log('=== Summary ===')
  console.log(`  Total: ${toGenerate.length}`)
  console.log(`  Success: ${success}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} min`)

  if (failedList.length > 0) {
    console.log()
    console.log('=== Failed images ===')
    for (const f of failedList) {
      console.log(`  - ${f}`)
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
