#!/usr/bin/env bash
# Regenerate fixtures/ from naralabs-atlas testdata/decoder (run after manifest changes).
set -euo pipefail
ATLAS="${1:?Usage: $0 /path/to/naralabs-atlas}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/fixtures"
exec python3 - "$ATLAS" "$OUT" <<'PY'
import json, pathlib, sys
atlas = pathlib.Path(sys.argv[1])
out_dir = pathlib.Path(sys.argv[2])
dec = atlas / 'testdata/decoder'
manifest = json.loads((dec / 'manifest.json').read_text())
reg = json.loads((atlas / 'testdata/registry/samples/manifest.json').read_text())
schema_to_contract = {}
for c in reg['contracts']:
    for ev in c['events']:
        schema_to_contract[pathlib.Path(ev['schemaFile']).stem] = c['contractId']
counter_cid = 'CBGROPHYFCL5FNTNJF6HXVJEWPLOMHZJ3MNISPTB2JHXLGKQMO2MCWK4'

def resolve(rel):
    if rel.startswith('schemas/'):
        return atlas / 'testdata/registry/samples' / rel
    if rel.startswith('fixtures/'):
        return dec / rel
    return dec / rel

out_dir.mkdir(parents=True, exist_ok=True)
index = []
for fx in manifest['fixtures']:
    topics = json.loads(resolve(fx['topicsFile']).read_text())
    value = json.loads(resolve(fx['valueFile']).read_text())
    schema_stem = pathlib.Path(fx['schemaFile']).name.replace('.json', '')
    if fx['schemaFile'].startswith('counter_') or fx['id'] == 'prefix_mismatch_raw':
        cid = counter_cid
    elif schema_stem in schema_to_contract:
        cid = schema_to_contract[schema_stem]
    else:
        cid = counter_cid
        for c in reg['contracts']:
            for ev in c['events']:
                if ev['eventName'] == fx['eventName']:
                    cid = c['contractId']
                    break
    body = {
        'network': 'testnet',
        'contractId': cid,
        'eventName': fx['eventName'],
        'topicsJson': topics,
        'valueJson': value,
    }
    index.append({'id': fx['id'], 'expect': fx['expect'], 'body': body})
    (out_dir / f"{fx['id']}.json").write_text(json.dumps(body, indent=2) + '\n')
(out_dir / 'index.json').write_text(json.dumps(index, indent=2) + '\n')
print(f"Synced {len(index)} fixtures -> {out_dir}")
PY
