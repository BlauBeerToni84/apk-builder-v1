#!/bin/bash

set -euo pipefail

WF="${1:-apk-build-manual.yml}"
REPO="${2:-BlauBeerToni84/apk-builder-v1}"
BR="${3:-main}"

echo "🚀 Starte Workflow '$WF' auf Branch '$BR'..."
# Workflow triggern
gh workflow run "$WF" -R "$REPO" -r "$BR" -f create_release=true

# Warten bis GH den Run registriert
sleep 5

# Neueste Run-ID ziehen
RUN_ID=$(gh run list -R "$REPO" --workflow="$WF" --limit 1 --json databaseId -q ".[0].databaseId")
if [[ -z "$RUN_ID" ]]; then
  echo "❌ Keine Run-ID gefunden!"
  exit 1
fi
echo "✅ Workflow gestartet! RUN_ID=$RUN_ID"

# Logs verfolgen bis fertig (mit Timeout)
timeout 600 gh run watch "$RUN_ID" -R "$REPO" --exit-status || echo "⚠️ Timeout nach 10 Minuten – prüfe manuell mit 'gh run view $RUN_ID -R $REPO'"

# APK runterziehen
echo "📦 Lade APK-Artefakt runter..."
mkdir -p artifacts
if ! gh run download "$RUN_ID" -R "$REPO" -n app-release -D artifacts/; then
  echo "❌ Fehler beim Download des Artefakts! Prüfe, ob 'app-release' existiert."
  exit 1
fi

echo "🎉 Fertig! APK liegt in ./artifacts/"
