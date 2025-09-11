#!/usr/bin/env bash
set -euo pipefail
export EXPO_DEBUG=1

echo "[INFO] expo auth:"
eas --version || true
eas whoami || true

# Stelle sicher, dass app.json Name/Slug/Owner besitzt
bash ci/_ensure_app_json.sh

echo "[INFO] resolve EXPO_PROJECT_ID ..."
if eas project:info --json > /tmp/info.json 2> /tmp/info.err; then
  ID="$(jq -r '.id // empty' /tmp/info.json || true)"
  echo "[OK] linked: ${ID:-<empty>}"
else
  echo "[INFO] no link -> project:init (non-interactive, reads app.json)"
  # Ohne zusätzliche Flags! EAS liest name/slug/owner aus app.json
  if ! eas project:init --non-interactive --force > /tmp/init.out 2> /tmp/init.err; then
    echo "[ERR] project:init failed"
    echo "=== init.err (first 200) ==="; sed -n '1,200p' /tmp/init.err || true
    echo "=== init.out (first 200) ==="; sed -n '1,200p' /tmp/init.out || true
    exit 1
  fi

  # Nach init erneut info ziehen (jetzt sollte verlinkt sein)
  if eas project:info --json > /tmp/info.json 2> /tmp/info.err; then
    ID="$(jq -r '.id // empty' /tmp/info.json || true)"
  fi

  # Fallback: UUID aus Ausgaben greifen
  if [ -z "${ID:-}" ]; then
    ID="$(grep -Eo '[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}' /tmp/init.out /tmp/init.err /tmp/info.json /tmp/info.err 2>/dev/null | head -n1 || true)"
  fi
fi

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

if jq -e 'any(.[]?; .status == "finished" or .composite_status == "finished")' build.json >/dev/null 2>&1; then
  echo "[INFO] download APK/AAB"
  eas build:download -p android --latest --profile "${EAS_PROFILE}" --path app-release.apk || true
else
  echo "[WARN] not finished -> skip download"
fi

ls -lah || true
