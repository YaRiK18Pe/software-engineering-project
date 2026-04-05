import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests must complete below 800ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/users`;
  const res = http.get(url);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
