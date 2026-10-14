import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const VALIDATOR = __ENV.VALIDATOR || 'class-validator';

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
    `${BASE_URL}/benchmark/${VALIDATOR}`,
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        validator: VALIDATOR,
      },
    },
  );

  check(response, {
    'status is 201': (r) => r.status === 201,
    'response is valid': (r) => {
      if (r.status !== 201) return false;

      try {
        const body = r.json();
        return body.valid === true && body.itemCount === payload.items.length;
      } catch {
        return false;
      }
    },
  });
}
