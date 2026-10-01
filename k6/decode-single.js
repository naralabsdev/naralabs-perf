/**
 * Instawards SOW Deliverable 2 — HTTP p95 benchmark for POST /v1/decode
 *
 * Measures end-to-end request time (network + Atlas + Postgres registry lookup).
 * Threshold: p(95) of http_req_duration < 500ms (configurable via P95_MS).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const baseUrl = (__ENV.BASE_URL || 'https://naralabs.io/api/atlas').replace(/\/$/, '');
const apiKey = __ENV.API_KEY || '';
const p95Ms = Number(__ENV.P95_MS || '500');
const vus = Number(__ENV.VUS || '5');
const duration = __ENV.DURATION || '30s';

if (!apiKey) {
  throw new Error('Set API_KEY (nl_api_…) in the environment');
}

const payload = JSON.parse(open('../fixtures/counter_incremented.json'));

export const options = {
  scenarios: {
    decode_single: {
      executor: 'constant-vus',
      vus,
      duration,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: [`p(95)<${p95Ms}`],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.post(`${baseUrl}/v1/decode`, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    tags: { name: 'POST /v1/decode' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'decodeStatus is decoded': (r) => {
      try {
        const body = r.json();
        return body.decodeStatus === 'decoded';
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.1);
}

export function handleSummary(data) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [`../reports/k6-decode-p95-${ts}.json`]: JSON.stringify(data, null, 2),
  };
}
