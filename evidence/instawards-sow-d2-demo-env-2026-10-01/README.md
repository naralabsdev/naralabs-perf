# Instawards SOW — Deliverable 2 HTTP latency evidence (demo environment)

**Run date (UTC):** 2026-10-01  
**Target:** `https://atlas.naralabs.io` (Stellar Soroban testnet, published registry)  
**Tool:** k6 v1.7+ · repo scripts `run-decode-p95.sh`, `run-decode-fixtures.sh`

## Archived JSON (reviewer attachment)

| File | SOW check | Measured |
| --- | --- | --- |
| [k6-decode-p95.json](./k6-decode-p95.json) | p95 `POST /v1/decode` &lt; 500 ms | **p(95) ≈ 72.6 ms** (939 HTTP reqs, 5 VUs, 30 s, `transfer` fixture); checks **100%** |
| [k6-decode-fixtures.json](./k6-decode-fixtures.json) | ≥ 90% fixture checks on HTTP | **18/18 checks pass (100%)** on 9 production-published fixtures (`PRODUCTION_FIXTURES=true`) |

## Reproduce

```bash
git clone https://github.com/naralabsdev/naralabs-perf
cd naralabs-perf && cp .env.example .env   # API_KEY=nl_api_…
./scripts/run-decode-p95.sh
./scripts/run-decode-fixtures.sh
```

New runs write timestamped files under `reports/` (gitignored). Copy into a dated folder here when refreshing submission evidence.

## Related

- Atlas written summary: [deliverable3-benchmark-report.md §2b](https://github.com/naralabsdev/naralabs-atlas/blob/main/docs/deliverable3-benchmark-report.md)
- In-process fixtures (11/11): `go test ./lib/decoder/ -run TestDeliverable2_DecoderSampleFixtures -v` in naralabs-atlas
