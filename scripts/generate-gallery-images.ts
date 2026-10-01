/**
 * generate-gallery-images.ts
 *
 * Generate 9 AI images untuk Workshop Documentation gallery.
 * Match innovation-caraudio.com:
 *  - 4 slide images (Instalasi Audio Mobil 1-4)
 *  - 5 bawahslide images (Dokumentasi workshop 1-5)
 */

import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/download/gallery-images'
const SIZE = '1344x768' as const

const STYLE = 'professional automotive workshop photography, car audio installation, premium quality, sharp focus, detailed, photorealistic, 8k quality'

interface GalleryImage {
  filename: string
  prompt: string
}

const IMAGES: GalleryImage[] = [
  // 4 Slide images — "Instalasi Audio Mobil"
  {
    filename: 'slide-1.webp',
    prompt: `Professional car audio installation workshop. Technician installing premium speakers in car door panel with DSP processor visible on workbench. Clean workshop with tools organized. ${STYLE}`,
  },
  {
    filename: 'slide-2.webp',
    prompt: `Professional car audio workshop showing amplifier installation in car trunk. Power Mono amplifier being wired with premium cables. Technician hands working precisely. ${STYLE}`,
  },
  {
    filename: 'slide-3.webp',
    prompt: `Professional subwoofer box installation in car trunk. Custom wooden subwoofer enclosure with 10 inch subwoofer being installed. Clean wiring and professional finish. ${STYLE}`,
  },
  {
    filename: 'slide-4.webp',
    prompt: `Professional DSP tuning session in car. Laptop connected to Rainbow DSP EL-PA4.6 with RTA measurement on screen. Car interior with premium audio system visible. ${STYLE}`,
  },
  // 5 Bawahslide images — "Dokumentasi Workshop"
  {
    filename: 'bawahslide-1.webp',
    prompt: `Innovation Car Audio workshop interior. Premium car audio showroom display with speakers, amplifiers, and subwoofers arranged elegantly. Dark luxury background with gold accent lighting. ${STYLE}`,
  },
  {
    filename: 'bawahslide-2.webp',
    prompt: `Car door panel with peredam Gran Turismo sound deadening material being applied. Butyl material on door panel, showing professional installation process. ${STYLE}`,
  },
  {
    filename: 'bawahslide-3.webp',
    prompt: `Premium car audio components display: Rainbow DSP, GZ Mercy speakers, Blam speakers, PHD speakers arranged on dark premium surface. Gold accent lighting. ${STYLE}`,
  },
  {
    filename: 'bawahslide-4.webp',
    prompt: `Professional car interior with completed audio installation. Premium speakers in door panels, custom subwoofer box in trunk, clean wiring visible. Luxury vehicle interior. ${STYLE}`,
  },
  {
    filename: 'bawahslide-5.webp',
    prompt: `Car audio competition trophy display. Multiple championship trophies and awards on shelf. EMMA and USACI competition awards visible. Gold accent lighting. ${STYLE}`,
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

  console.log('=== Gallery Image Generator (9 images) ===')
  console.log(`Output: ${OUTPUT_DIR}`)
  console.log(`Total: ${IMAGES.length} images`)
  console.log()

  // Resume: skip existing
  const toGenerate = IMAGES.filter((img) => {
    const p = path.join(OUTPUT_DIR, img.filename.replace('.webp', '.png'))
    return !fs.existsSync(p) || fs.statSync(p).size < 1000
  })

  console.log(`Already exists: ${IMAGES.length - toGenerate.length}`)
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
    const img = toGenerate[i]
    const filename = img.filename.replace('.webp', '.png')
    const fullPath = path.join(OUTPUT_DIR, filename)
    const progress = `[${i + 1}/${toGenerate.length}]`
    const eta = ((Date.now() - startTime) / (i + 1) * (toGenerate.length - i - 1) / 1000 / 60).toFixed(1)

    console.log(`${progress} ${img.filename} (ETA: ${eta} min)`)

    const result = await generateOne(zai, img.prompt, fullPath)
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
