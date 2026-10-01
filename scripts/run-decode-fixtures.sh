#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ -f .env ]]; then set -a && source .env && set +a; fi
: "${API_KEY:?Set API_KEY in .env or environment}"
command -v k6 >/dev/null || { echo "Install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/"; exit 1; }
echo "BASE_URL=${BASE_URL:-https://naralabs.io/api/atlas} FIXTURE_ITERATIONS=${FIXTURE_ITERATIONS:-11}"
k6 run k6/decode-fixtures.js
