/**
 * generate-sample-image.ts
 *
 * Generate 1 sample image untuk evaluasi style sebelum batch 92 gambar.
 * Sample: Simple Upgrade Best Buy (img-1: main overview)
 */

import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = '/home/z/my-project/download/product-images'
const OUTPUT_FILE = 'simple-upgrade-best-buy-1.png'

const PROMPT = `Professional car audio showroom display featuring DSP Rainbow EL-PA4.6 with controller unit, Power Mono Prototype Quarto amplifier, and 10-inch subwoofer Prototype Quarto. Premium car audio installation display. Components arranged elegantly on premium dark display surface with subtle warm amber gold accent lighting, premium luxurious atmosphere, dark luxury background, professional automotive showroom photography, high-end car audio installation display, premium quality, sharp focus, detailed, photorealistic, 8k quality, automotive enthusiast aesthetic`

const SIZE = '1344x768' as const

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE)
  console.log('=== Sample Image Generator ===')
  console.log(`Output: ${outputPath}`)
  console.log(`Size: ${SIZE}`)
  console.log(`Prompt: ${PROMPT.slice(0, 100)}...`)
  console.log()

  console.log('Initializing ZAI SDK...')
  const zai = await ZAI.create()

  console.log('Generating image (this may take 30-60 seconds)...')
  const startTime = Date.now()

  try {
    const response = await zai.images.generations.create({
      prompt: PROMPT,
      size: SIZE,
    })

    const base64 = response?.data?.[0]?.base64
    if (!base64) {
      console.error('✗ No image data returned')
      console.log('Full response:', JSON.stringify(response, null, 2))
      process.exit(1)
    }

    const buffer = Buffer.from(base64, 'base64')
    fs.writeFileSync(outputPath, buffer)

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    const sizeKB = (buffer.length / 1024).toFixed(0)

    console.log()
    console.log('=== SUCCESS ===')
    console.log(`  File: ${outputPath}`)
    console.log(`  Size: ${sizeKB} KB`)
    console.log(`  Duration: ${duration}s`)
    console.log()
    console.log('→ Review image, then run generate-product-images.ts to batch all 92')
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`✗ Generation failed: ${errMsg}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
