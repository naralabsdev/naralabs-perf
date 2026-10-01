/**
 * Rotate prepared decoder fixtures (same set as Atlas TestDeliverable2).
 * Each VU iteration picks a fixture; checks decodeStatus matches manifest expect.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const baseUrl = (__ENV.BASE_URL || 'https://atlas.naralabs.io').replace(/\/$/, '');
const apiKey = __ENV.API_KEY || '';
const iterations = Number(__ENV.FIXTURE_ITERATIONS || '11');

if (!apiKey) {
  throw new Error('Set API_KEY (nl_api_…) in the environment');
}

const fixtures = JSON.parse(open('../fixtures/index.json'));

export const options = {
  scenarios: {
    decode_fixtures: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: Math.max(iterations, fixtures.length),
      maxDuration: '5m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    checks: ['rate>=0.90'],
  },
};

export default function () {
  const fx = fixtures[__ITER % fixtures.length];
  const res = http.post(`${baseUrl}/v1/decode`, JSON.stringify(fx.body), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    tags: { name: `fixture:${fx.id}` },
  });

  if (fx.expect === 'decoded') {
    check(res, {
      [`${fx.id} status 200`]: (r) => r.status === 200,
      [`${fx.id} decoded`]: (r) => {
        try {
          return r.json().decodeStatus === 'decoded';
        } catch (e) {
          return false;
        }
      },
    });
  } else if (fx.expect === 'raw') {
    check(res, {
      [`${fx.id} status 200`]: (r) => r.status === 200,
      [`${fx.id} raw fallback`]: (r) => {
        try {
          return r.json().decodeStatus === 'raw';
        } catch (e) {
          return false;
        }
      },
    });
  }

  sleep(0.05);
}

export function handleSummary(data) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [`../reports/k6-decode-fixtures-${ts}.json`]: JSON.stringify(data, null, 2),
  };
}
