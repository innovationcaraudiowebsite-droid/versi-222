/**
 * generate-84-images.ts
 *
 * Generate 84 AI images (1 per variant) with accent lighting per tier.
 *
 * Strategy:
 *  - Lifestyle/showroom style (in-car installation + dramatic lighting)
 *  - Accent lighting per tier:
 *    - basic       → slate/gray accent
 *    - normal      → blue accent
 *    - best_buy    → amber/gold accent
 *    - recommended → emerald/green accent
 *  - Size: 1344x768 (landscape 16:9)
 *
 * Resume capability: skip files that already exist.
 */

import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/download/product-images-v2'
const SIZE = '1344x768' as const

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

const STYLE_BASE = `professional automotive showroom photography, high-end car audio installation display, premium quality, sharp focus, detailed, photorealistic, 8k quality, automotive enthusiast aesthetic`

interface ImageSpec {
  slug: string
  category: string
  tier: string
  speaker: string
  subwoofer: string
  way: string
}

function buildPrompt(v: ImageSpec): string {
  const accent = TIER_ACCENT[v.tier] || TIER_ACCENT.basic
  return `Professional car audio showroom display featuring ${v.way} speaker system with ${v.speaker}, ${v.subwoofer}, DSP Rainbow EL-PA4.6 with controller, Power Mono Prototype Quarto amplifier. ${accent.lighting}, dark luxury background, ${STYLE_BASE}`
}

// All 84 variants
const SPEAKERS: Record<string, Record<string, string>> = {
  'Simple Upgrade': {
    basic: 'original factory speakers', normal: 'original factory speakers',
    best_buy: 'original factory speakers with DSP controller',
    recommended: 'original factory speakers with premium DSP setup',
  },
  'Entry': {
    basic: 'Infinity Alpha 650C 2 Way 6.5 inch speakers',
    normal: 'Rainbow Experience Line EL-C6.2 2 Way 6.5 inch speakers',
    best_buy: 'Blam Relax 165 RX 2 Way 6.5 inch speakers',
    recommended: 'GZ Mercy GZCS 100.2 MB 2 Way 4 inch speakers with Jaring CNC',
  },
  'Daily Use': {
    basic: 'PHD MF 6.1 KIT 2 Way 6.5 inch speakers',
    normal: 'Rainbow Experience Line EL-C6.2 2 Way 6.5 inch speakers',
    best_buy: 'Blam Relax 165 RX 2 Way 6.5 inch speakers',
    recommended: 'GZ Mercy GZCS 100.2 MB 2 Way 4 inch speakers with Jaring CNC',
  },
  'Affordable High End': {
    basic: 'PHD MF 6.1 KIT 2 Way 6.5 inch speakers',
    normal: 'Morel Maximo 6 2 Way 6.5 inch speakers',
    best_buy: 'GZ RadioActive GZRT 25 SQ and GZRK 165 SQ 2 Way speakers',
    recommended: 'GZ Mercy GZCS 100.2 MB 2 Way 4 inch speakers with Jaring CNC',
  },
}

const SUB_CATS: Array<[string, string, string, string]> = [
  // [name, slug_part, way, subwoofer]
  ['2 Way Subwoofer Bawah Jok', '2way-sub-bawah-jok', '2 Way', '8 inch subwoofer under seat (Zevox ZV 8 SAS)'],
  ['2 Way Subwoofer Quarto 10" (bagasi)', '2way-sub-quarto-10-bagasi', '2 Way', '10 inch Prototype Quarto subwoofer in trunk'],
  ['2 Way Subwoofer PHD 8" (bagasi)', '2way-sub-phd-8-bagasi', '2 Way', '8 inch PHD subwoofer in trunk'],
  ['2 Way Subwoofer Cresscendo 10" (bagasi)', '2way-sub-cresscendo-10-bagasi', '2 Way', '10 inch Cresscendo subwoofer in trunk'],
  ['3 Way Subwoofer Bawah Jok', '3way-sub-bawah-jok', '3 Way', '8 inch subwoofer under seat (Zevox ZV 8 SAS)'],
  ['3 Way Subwoofer Quarto 10" (bagasi)', '3way-sub-quarto-10-bagasi', '3 Way', '10 inch Prototype Quarto subwoofer in trunk'],
  ['3 Way Subwoofer PHD 8" (bagasi)', '3way-sub-phd-8-bagasi', '3 Way', '8 inch PHD subwoofer in trunk'],
  ['3 Way Subwoofer Cresscendo 10" (bagasi)', '3way-sub-cresscendo-10-bagasi', '3 Way', '10 inch Cresscendo subwoofer in trunk'],
]

const VARIANTS = [
  { name: 'Basic', tier: 'basic', slug: 'basic' },
  { name: 'Normal', tier: 'normal', slug: 'normal' },
  { name: 'Best Buy', tier: 'best_buy', slug: 'best-buy' },
  { name: 'Recommended', tier: 'recommended', slug: 'recommended' },
]

const CATEGORIES = [
  { name: 'Simple Upgrade', slug: 'simple-upgrade', subCount: 0 },
  { name: 'Entry', slug: 'entry', subCount: 4, subStart: 0 },
  { name: 'Daily Use', slug: 'daily-use', subCount: 8, subStart: 0 },
  { name: 'Affordable High End', slug: 'affordable-high-end', subCount: 8, subStart: 0 },
]

function buildAllSpecs(): ImageSpec[] {
  const specs: ImageSpec[] = []

  for (const cat of CATEGORIES) {
    const catSlug = cat.slug
    const catName = cat.name

    if (cat.subCount === 0) {
      // Simple Upgrade: 4 variants directly
      for (const v of VARIANTS) {
        specs.push({
          slug: `${catSlug}-${v.slug}`,
          category: catName,
          tier: v.tier,
          speaker: SPEAKERS[catName][v.tier],
          subwoofer: '8 inch subwoofer under seat (Zevox ZV 8 SAS)',
          way: '2 Way',
        })
      }
    } else {
      // Categories with sub-categories
      for (let i = 0; i < cat.subCount; i++) {
        const sub = SUB_CATS[i]
        for (const v of VARIANTS) {
          specs.push({
            slug: `${catSlug}-${sub[1]}-${v.slug}`,
            category: catName,
            tier: v.tier,
            speaker: SPEAKERS[catName][v.tier],
            subwoofer: sub[3],
            way: sub[2],
          })
        }
      }
    }
  }

  return specs
}

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

  const allSpecs = buildAllSpecs()
  console.log('=== 84 Image Generator ===')
  console.log(`Output: ${OUTPUT_DIR}`)
  console.log(`Total: ${allSpecs.length} images`)

  // Resume: skip existing
  const toGenerate = allSpecs.filter((s) => {
    const p = path.join(OUTPUT_DIR, `${s.slug}.png`)
    return !fs.existsSync(p) || fs.statSync(p).size < 1000
  })

  console.log(`Already exists: ${allSpecs.length - toGenerate.length}`)
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
    const spec = toGenerate[i]
    const filename = `${spec.slug}.png`
    const fullPath = path.join(OUTPUT_DIR, filename)
    const prompt = buildPrompt(spec)
    const progress = `[${i + 1}/${toGenerate.length}]`
    const eta = ((Date.now() - startTime) / (i + 1) * (toGenerate.length - i - 1) / 1000 / 60).toFixed(1)

    console.log(`${progress} ${spec.category} - ${spec.tier} → ${filename} (ETA: ${eta} min)`)

    const result = await generateOne(zai, prompt, fullPath)
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
