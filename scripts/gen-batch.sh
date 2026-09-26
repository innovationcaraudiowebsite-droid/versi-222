#!/bin/bash
# Generate product images in batches of 10
# Each batch runs ~5 min, then script exits cleanly
# User can re-run to continue from where left off (resume capability)

cd /home/z/my-project

# Generate 10 images, then exit
timeout 540 bun run scripts/generate-product-images.ts 2>&1 | tail -30
