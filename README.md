# naralabs-perf

k6 load and acceptance benchmarks for **[NaraLabs Atlas](https://github.com/naralabsdev/naralabs-atlas)** — HTTP-level evidence for Instawards SOW Deliverable 2 (p95 decode latency) and Deliverable 3 (benchmark report).

Fixtures are exported from `naralabs-atlas/testdata/decoder/` as real `POST /v1/decode` bodies (`topicsJson` / `valueJson`).

## Prerequisites

- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) v0.48+
- Atlas **developer API key** (`nl_api_…`) with decode access
- Target base URL (production BFF default below)

## Quick start

```bash
cp .env.example .env
# edit .env: API_KEY, optional BASE_URL

set -a && source .env && set +a

# SOW p95: single-event POST /v1/decode (default 5 VUs, 30s)
./scripts/run-decode-p95.sh

# SOW success rate: rotate all 11 prepared fixtures (expect ≥90% checks pass)
./scripts/run-decode-fixtures.sh
```

## Scripts

| Script | k6 test | SOW alignment |
|--------|---------|----------------|
| `scripts/run-decode-p95.sh` | `k6/decode-single.js` | p95 `http_req_duration` **&lt; 500ms** on live API |
| `scripts/run-decode-fixtures.sh` | `k6/decode-fixtures.js` | Prepared fixtures; checks match `expect` (decoded/raw) |

Reports written to `reports/` (JSON summary; local runs gitignored).

## Archived submission evidence (Deliverable 2)

Committed k6 summary JSON for Instawards / Chapter Lead review:

**[evidence/instawards-sow-d2-demo-env-2026-10-01/](evidence/instawards-sow-d2-demo-env-2026-10-01/)** — README + `k6-decode-p95.json` (p95 ≈ 72.6 ms) + `k6-decode-fixtures.json` (100% checks, 9 HTTP fixtures).

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://atlas.naralabs.io` | Atlas API base (no trailing slash); use this host for `nl_api_` keys |
| `API_KEY` | *(required)* | Bearer token without `Bearer ` prefix |
| `VUS` | `5` | Virtual users (p95 test) |
| `DURATION` | `30s` | Load duration (p95 test) |
| `FIXTURE_ITERATIONS` | `11` | One iteration per fixture minimum in smoke test |

## Compare to Go fixture test

| | `TestDeliverable2` (Atlas repo) | naralabs-perf (this repo) |
|--|--------------------------------|---------------------------|
| Scope | In-process `DecodeEvent` | Full HTTP + auth + registry DB |
| p95 | Local engine smoke | **`http_req_duration` on `/v1/decode`** |
| Success rate | 11/11 manifest expectations | k6 checks per fixture `expect` |

Use **both** in completion evidence: Go test for CI/core engine; k6 for **demo environment** API latency.

## Regenerate fixtures from Atlas

When decoder manifest changes:

```bash
./scripts/sync-fixtures-from-atlas.sh ../naralabs-atlas
```

## GitHub Actions (optional)

Workflow: `.github/workflows/k6-decode.yml`. Add repository secret **`NARALABS_API_KEY`**, then run **Actions → k6 decode benchmark** (manual dispatch). Mirror copy: `ci/github-actions/k6-decode.yml`.

## Repository

**https://github.com/naralabsdev/naralabs-perf**

## License

MIT — NaraLabs Foundation
