const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3004';
const LOGGER = process.env.LOGGER || 'silent';

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
  response.status === 200 && json?.ok === true && json?.message === 'logger-benchmark',
  `benchmark failed: status=${response.status} body=${JSON.stringify(json)}`,
);

console.log(`ok  logger=${LOGGER}`);
console.log('smoke passed');
