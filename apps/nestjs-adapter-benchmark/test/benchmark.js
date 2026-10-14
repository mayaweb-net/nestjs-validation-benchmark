import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3001';
const ADAPTER = __ENV.ADAPTER || 'express';

const payload = JSON.parse(open('./payload.json'));

export const options = {
  scenarios: {
    benchmark: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE || 100),
      timeUnit: '1s',
      duration: __ENV.DURATION || '60s',
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const response = http.post(
    `${BASE_URL}/benchmark`,
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        adapter: ADAPTER,
      },
    },
  );

  check(response, {
    'status is 201': (r) => r.status === 201,
    'response is valid': (r) => {
      if (r.status !== 201) return false;

      try {
        const body = r.json();
        return (
          body.ok === true &&
          body.id === payload.id &&
          body.message === payload.message &&
          body.count === payload.count
        );
      } catch {
        return false;
      }
    },
  });
}
