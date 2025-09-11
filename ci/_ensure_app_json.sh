#!/usr/bin/env bash
set -euo pipefail

NAME="apk-builder-v1"
SLUG="apk-builder-v1"
OWNER="${EXPO_OWNER:-blaubeertoni84}"
UUID_RE='^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'

if [ ! -f app.json ]; then
  cat > app.json <<JSON
{ "expo": { "name": "$NAME", "slug": "$SLUG", "owner": "$OWNER" } }
JSON
  echo "[OK] created minimal app.json"
else
  command -v jq >/dev/null || { echo "[ERR] jq missing"; exit 1; }
  tmp=$(mktemp)
  jq --arg n "$NAME" --arg s "$SLUG" --arg o "$OWNER" --arg re "$UUID_RE" '
    def valid_uuid: (type=="string") and (test($re));
    .expo = (.expo // {}) |
    .expo.name  = (.expo.name  // $n) |
    .expo.slug  = (.expo.slug  // $s) |
    .expo.owner = (.expo.owner // $o) |
    (if (.expo.extra.eas.projectId // null) | valid_uuid
      then .
      else del(.expo.extra.eas.projectId)
     end)
  ' app.json > "$tmp" && mv "$tmp" app.json
  echo "[OK] ensured app.json fields & purged invalid projectId"
fi
