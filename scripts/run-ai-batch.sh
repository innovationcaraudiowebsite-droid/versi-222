#!/bin/bash
# Run AI image generation in a loop until time limit reached.
# Usage: bash scripts/run-ai-batch.sh [minutes]
# Default: 8 minutes

LIMIT_MIN=${1:-8}
LIMIT_SEC=$((LIMIT_MIN * 60))
START_TIME=$(date +%s)

cd /home/z/my-project

BATCH=8
START=0

# Find next article to process
NEXT=$(python3 -c "
import json
with open('data/backup-sqlite.json') as f:
    data = json.load(f)
gen = [a for a in data.get('articles',[]) if a.get('id','').startswith('art-500-')]
for i, a in enumerate(gen):
    if not a.get('imageUrl','').startswith('/article-images-ai/'):
        print(i)
        break
else:
    print(-1)
")
START=$NEXT

if [ "$START" = "-1" ]; then
    echo "All 500 articles have AI images!"
    exit 0
fi

echo "Starting from index $START, time limit ${LIMIT_MIN}min"
echo ""

while true; do
    NOW=$(date +%s)
    ELAPSED=$((NOW - START_TIME))
    REMAINING=$((LIMIT_SEC - ELAPSED))
    
    if [ $REMAINING -lt 60 ]; then
        echo "Time limit approaching ($REMAINING sec left). Stopping."
        break
    fi
    
    echo "=== Batch from start=$START, ${REMAINING}s remaining ==="
    python3 scripts/generate-ai-images.py --batch $BATCH --start $START 2>&1 | tail -5
    
    # Find next start
    NEXT=$(python3 -c "
import json
with open('data/backup-sqlite.json') as f:
    data = json.load(f)
gen = [a for a in data.get('articles',[]) if a.get('id','').startswith('art-500-')]
for i, a in enumerate(gen):
    if not a.get('imageUrl','').startswith('/article-images-ai/'):
        print(i)
        break
else:
    print(-1)
")
    
    if [ "$NEXT" = "-1" ]; then
        echo "All 500 articles have AI images!"
        break
    fi
    
    START=$NEXT
    echo ""
done

echo ""
echo "=== Final progress ==="
ls public/article-images-ai/ | wc -l
echo "images on disk"
python3 -c "
import json
with open('data/backup-sqlite.json') as f:
    data = json.load(f)
gen = [a for a in data.get('articles',[]) if a.get('id','').startswith('art-500-')]
with_ai = [a for a in gen if a.get('imageUrl','').startswith('/article-images-ai/')]
print(f'{len(with_ai)}/500 articles have AI images in JSON')
"
