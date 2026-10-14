import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3003';
const SERIALIZER = __ENV.SERIALIZER || 'default';

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
  const response = http.get(`${BASE_URL}/benchmark`, {
    tags: {
      serializer: SERIALIZER,
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response is valid': (r) => {
      if (r.status !== 200) return false;

      try {
        const body = r.json();
        return (
          body.id === '550e8400-e29b-41d4-a716-446655440000' &&
          body.email === 'benchmark@example.com' &&
          Array.isArray(body.items) &&
          body.items.length === 20 &&
          body.password === undefined
        );
      } catch {
        return false;
      }
    },
  });
}
