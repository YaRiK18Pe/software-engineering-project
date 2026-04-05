import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 30 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/users`;
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // Create User
  const postRes = http.post(url, JSON.stringify({ name: 'StressUser', age: 30 }), params);
  
  check(postRes, {
    'created user status is 201': (r) => r.status === 201,
  });

  if (postRes.status === 201) {
    const user = postRes.json();
    const userId = user._id;

    if (userId) {
      // Get User
      const getRes = http.get(`${url}/${userId}`);
      check(getRes, {
        'get user status is 200': (r) => r.status === 200,
      });

      // Delete User
      const delRes = http.del(`${url}/${userId}`);
      check(delRes, {
        'delete user status is 200': (r) => r.status === 200,
      });
    }
  }

  sleep(1);
}
