import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3004';
const LOGGER = __ENV.LOGGER || 'silent';

export const options = {
  scenarios: {
    benchmark: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE || 500),
      timeUnit: '1s',
      duration: __ENV.DURATION || '60s',
      preAllocatedVUs: 50,
      maxVUs: 300,
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
      logger: LOGGER,
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response is valid': (r) => {
      if (r.status !== 200) return false;

      try {
        const body = r.json();
        return body.ok === true && body.message === 'logger-benchmark';
      } catch {
        return false;
      }
    },
  });
}
