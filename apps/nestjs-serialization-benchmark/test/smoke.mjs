const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3003';
const EXPECTED_SERIALIZER = process.env.SERIALIZER?.toLowerCase();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const response = await fetch(`${BASE_URL}/benchmark`);
let json = null;
try {
  json = await response.json();
} catch {
  json = null;
}

assert(
  response.status === 200 &&
    json?.id === '550e8400-e29b-41d4-a716-446655440000' &&
    json?.email === 'benchmark@example.com' &&
    Array.isArray(json?.items) &&
    json.items.length === 20 &&
    json.password === undefined,
  `benchmark failed: status=${response.status} body=${JSON.stringify(json)}`,
);

if (EXPECTED_SERIALIZER) {
  console.log(`ok  serializer=${EXPECTED_SERIALIZER}`);
} else {
  console.log('ok  /benchmark');
}

console.log('smoke passed');
