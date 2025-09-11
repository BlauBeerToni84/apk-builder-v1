#!/usr/bin/env bash
set -euo pipefail

export EXPO_DEBUG=1

echo "[INFO] expo auth:"
eas --version || true
eas whoami || true

# Owner heuristisch aus whoami ziehen (fallback auf GitHub-Owner)
OWNER="$(eas whoami 2>/dev/null | awk '{print $1}' || true)"
if [ -z "${OWNER:-}" ]; then
  OWNER="${GITHUB_REPOSITORY%%/*}"
fi
APP_NAME="apk-builder-v1"
APP_SLUG="apk-builder-v1"

echo "[INFO] resolve EXPO_PROJECT_ID ..."

# Versuche bestehende Link-Info
if eas project:info --json > /tmp/info.json 2> /tmp/info.err; then
  ID="$(jq -r '.id // empty' /tmp/info.json || true)"
  echo "[OK] linked: ${ID:-<empty>}"
else
  echo "[INFO] no link -> project:init (owner=${OWNER})"
  # stdout & stderr in Dateien loggen (beide!), weil EAS oft auf stdout schreibt
  if ! eas project:init \
        --non-interactive \
        --force \
        --name "${APP_NAME}" \
        --slug "${APP_SLUG}" \
        --owner "${OWNER}" \
        --json > /tmp/init.json 2> /tmp/init.err; then
    echo "[ERR] project:init failed"
    echo "=== init.err (first 200 lines) ==="; sed -n '1,200p' /tmp/init.err || true
    echo "=== init.json (first 200 lines) ==="; sed -n '1,200p' /tmp/init.json || true
    exit 1
  fi
  echo "[INFO] project:init raw outputs saved to /tmp/init.json / /tmp/init.err"
  # Erst JSON-Parsing versuchen, dann UUID via grep fallback
  ID="$(jq -r '.id // empty' /tmp/init.json 2>/dev/null || true)"
  if [ -z "${ID:-}" ]; then
    ID="$(grep -Eo '[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}' /tmp/init.json /tmp/init.err 2>/dev/null | head -n1 || true)"
  fi
fi

# Validierung + zusätzliche Dumps bei Problemen
if [ -z "${ID:-}" ] || ! printf '%s' "$ID" | grep -Eq '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'; then
  echo "[ERR] invalid EXPO_PROJECT_ID"
  echo "=== info.json ==="; sed -n '1,200p' /tmp/info.json 2>/dev/null || true
  echo "=== info.err  ==="; sed -n '1,200p' /tmp/info.err  2>/dev/null || true
  echo "=== init.json ==="; sed -n '1,200p' /tmp/init.json 2>/dev/null || true
  echo "=== init.err  ==="; sed -n '1,200p' /tmp/init.err  2>/dev/null || true
  echo "=== repo files ==="; ls -la || true
  echo "=== app.json (if any) ==="; sed -n '1,200p' app.json 2>/dev/null || echo "(no app.json)"
  exit 1
fi

echo "[OK] EXPO_PROJECT_ID=$ID"
echo "EXPO_PROJECT_ID=$ID" >> "$GITHUB_ENV"

echo "[INFO] start cloud build"
eas --version && eas whoami
eas build -p android --profile "${EAS_PROFILE}" --non-interactive --wait --json > build.json

echo "[OK] build.json:"
sed -n '1,200p' build.json || true

# EAS liefert bei --wait ein Array von Builds; prüfe auf "finished"
if jq -e 'any(.[]?; .status == "finished" or .composite_status == "finished")' build.json >/dev/null 2>&1; then
  echo "[INFO] download APK/AAB"
  eas build:download -p android --latest --profile "${EAS_PROFILE}" --path app-release.apk || true
else
  echo "[WARN] not finished -> skip download"
fi

ls -lah || true
