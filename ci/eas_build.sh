#!/usr/bin/env bash
set -euo pipefail

echo "[INFO] resolve EXPO_PROJECT_ID ..."
if eas project:info --json >/tmp/info.json 2>/dev/null; then
  ID="$(jq -r '.id // empty' /tmp/info.json || true)"
  echo "[OK] linked: $ID"
else
  echo "[INFO] no link -> project:init"
  if ! eas project:init --non-interactive --force --json >/tmp/init.json 2>/tmp/init.err; then
    echo "[ERR] project:init failed:"
    sed -n '1,200p' /tmp/init.err || true
    exit 1
  fi
  ID="$(jq -r '.id // empty' /tmp/init.json || true)"
  if [ -z "${ID:-}" ] || ! printf "%s" "$ID" | grep -Eq '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'; then
    echo "[ERR] invalid EXPO_PROJECT_ID"
    echo "=== init.json ==="; cat /tmp/init.json || true
    echo "=== init.err  ==="; sed -n '1,200p' /tmp/init.err || true
    exit 1
  fi
fi
echo "EXPO_PROJECT_ID=$ID" >> "$GITHUB_ENV"

echo "[INFO] start cloud build"
eas --version && eas whoami
eas build -p android --profile "${EAS_PROFILE}" --non-interactive --wait --json > build.json
echo "[OK] build.json:"; cat build.json

if jq -e 'any(.[]; .status=="finished")' build.json >/dev/null 2>&1; then
  echo "[INFO] download APK/AAB"
  eas build:download -p android --latest --profile "${EAS_PROFILE}" --path app-release.apk || true
else
  echo "[WARN] not finished -> skip download"
fi

ls -lah || true
