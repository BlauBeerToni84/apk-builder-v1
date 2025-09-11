#!/usr/bin/env bash
set -euo pipefail

NAME="apk-builder-v1"
SLUG="apk-builder-v1"
OWNER="${EXPO_OWNER:-blaubeertoni84}"

if [ ! -f app.json ]; then
  cat > app.json <<JSON
{ "expo": { "name": "$NAME", "slug": "$SLUG", "owner": "$OWNER" } }
JSON
  echo "[OK] created minimal app.json"
else
  # falls jq fehlt (sollte im Job installiert sein), breche sauber ab
  command -v jq >/dev/null || { echo "[ERR] jq missing"; exit 1; }

  # fehlende Felder ergänzen, vorhandene respektieren
  tmp=$(mktemp)
  jq --arg n "$NAME" --arg s "$SLUG" --arg o "$OWNER" '
    .expo = (.expo // {}) |
    .expo.name  = (.expo.name  // $n) |
    .expo.slug  = (.expo.slug  // $s) |
    .expo.owner = (.expo.owner // $o)
  ' app.json > "$tmp" && mv "$tmp" app.json
  echo "[OK] ensured app.json fields (name/slug/owner)"
fi
