#!/usr/bin/env bash
# Local backup of everything: the site code (this repo) plus the live data in
# Supabase (folder tree, guest-book board, uploaded materials).
# Usage:  bash scripts/backup.sh
set -euo pipefail

URL="https://knpwwgqkpcfjupsegouu.supabase.co"
KEY="sb_publishable_2xqtnwBkGZeYEyJJf7VtyA_dm9c-pFf"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
OUT="$ROOT/backup/$STAMP"
mkdir -p "$OUT/data" "$OUT/uploads"

echo "→ backing up to $OUT"

# 1. the site code (a zip of the working tree, minus git + old backups)
( cd "$ROOT" && zip -q -r "$OUT/site-code.zip" . -x ".git/*" "backup/*" )
echo "  ✓ site-code.zip"

# 2. Supabase tables → JSON
curl -s "$URL/rest/v1/folders?select=*&order=pos.asc" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" > "$OUT/data/folders.json"
curl -s "$URL/rest/v1/board?select=*&order=created_at.asc" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" > "$OUT/data/board.json"
echo "  ✓ folders.json, board.json"

# 3. uploaded materials → files
LIST="$(curl -s -X POST "$URL/storage/v1/object/list/uploads" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"prefix":"","limit":1000,"sortBy":{"column":"name","order":"asc"}}')"
echo "$LIST" > "$OUT/data/uploads-index.json"
echo "$LIST" | /usr/bin/python3 -c "import sys,json;[print(o['name']) for o in json.load(sys.stdin) if o.get('name')]" 2>/dev/null | while read -r name; do
  [ -z "$name" ] && continue
  curl -s "$URL/storage/v1/object/public/uploads/$name" -o "$OUT/uploads/$name"
done
echo "  ✓ uploads/ ($(ls -1 "$OUT/uploads" | wc -l | tr -d ' ') files)"

echo "→ done. Backup at: $OUT"
