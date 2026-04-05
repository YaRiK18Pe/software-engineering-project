import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/users`;
  
  // 1. Get all users
  const getRes = http.get(url);
  check(getRes, {
    'get users status is 200': (r) => r.status === 200,
  });

  // 2. Create a user
  const payload = JSON.stringify({
    name: 'K6 User ' + __VU + '-' + __ITER,
    age: 25,
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const postRes = http.post(url, payload, params);
  check(postRes, {
    'create user status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
