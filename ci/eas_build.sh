#!/usr/bin/env bash
set -euo pipefail
export EXPO_DEBUG=1

echo "[INFO] expo auth:"
eas --version || true
eas whoami || true

# Stelle sicher, dass app.json Name/Slug/Owner hat und ggf. invalide projectId rausfliegt
bash ci/_ensure_app_json.sh

# --- Hilfsfunktion: ID aus JSON ODER Text extrahieren ---
get_id_from_file() {
  local f1="$1"; shift || true
  local f2="${1:-}"; shift || true
  # JSON versuchen
  local _id
  _id="$(jq -r '.id // empty' "$f1" 2>/dev/null || true)"
  if [ -z "${_id:-}" ]; then
    # Fallback: erste UUID in (Text-)Ausgaben greifen
    _id="$(grep -Eo '[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}' "$f1" ${f2:+$f2} 2>/dev/null | head -n1 || true)"
  fi
  printf '%s' "${_id:-}"
}

echo "[INFO] resolve EXPO_PROJECT_ID ..."
ID=""
if eas project:info --json > /tmp/info.json 2> /tmp/info.err; then
  ID="$(get_id_from_file /tmp/info.json /tmp/info.err)"
  echo "[OK] linked (project:info): ${ID:-<empty>}"
else
  echo "[INFO] no link -> project:init (non-interactive, reads app.json)"
  if ! eas project:init --non-interactive --force > /tmp/init.out 2> /tmp/init.err; then
    echo "[ERR] project:init failed"
    echo "=== init.err (first 200) ==="; sed -n '1,200p' /tmp/init.err || true
    echo "=== init.out (first 200) ==="; sed -n '1,200p' /tmp/init.out || true
    exit 1
  fi
  # Nach init erneut info ziehen
  eas project:info --json > /tmp/info.json 2> /tmp/info.err || true
  ID="$(get_id_from_file /tmp.info.json /tmp/info.err)"
fi

# Wenn noch leer → Debug-Ausgaben und Abbruch
if [ -z "${ID:-}" ] || ! printf '%s' "$ID" | grep -Eq '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'; then
  echo "[ERR] invalid EXPO_PROJECT_ID"
  echo "=== info.json ==="; sed -n '1,200p' /tmp/info.json 2>/dev/null || true
  echo "=== info.err  ==="; sed -n '1,200p' /tmp/info.err  2>/dev/null || true
  echo "=== init.out  ==="; sed -n '1,200p' /tmp/init.out  2>/dev/null || true
  echo "=== init.err  ==="; sed -n '1,200p' /tmp/init.err  2>/dev/null || true
  echo "=== app.json  ==="; sed -n '1,200p' app.json       2>/dev/null || echo "(no app.json)"
  exit 1
fi

echo "[OK] EXPO_PROJECT_ID=$ID"
echo "EXPO_PROJECT_ID=$ID" >> "$GITHUB_ENV"

echo "[INFO] start cloud build"
eas --version && eas whoami
eas build -p android --profile "${EAS_PROFILE}" --non-interactive --wait --json > build.json

echo "[OK] build.json:"
sed -n '1,200p' build.json || true

# --wait liefert Array von Builds – check auf finished
if jq -e 'any(.[]?; .status == "finished" or .composite_status == "finished")' build.json >/dev/null 2>&1; then
  echo "[INFO] download APK/AAB"
  eas build:download -p android --latest --profile "${EAS_PROFILE}" --path app-release.apk || true
else
  echo "[WARN] not finished -> skip download"
fi

ls -lah || true
