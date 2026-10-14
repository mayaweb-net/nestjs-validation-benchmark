import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3001';
const EXPECTED_ADAPTER = process.env.ADAPTER?.toLowerCase();
const __dirname = dirname(fileURLToPath(import.meta.url));
const payload = JSON.parse(readFileSync(join(__dirname, 'payload.json'), 'utf8'));

async function post(body) {
  const response = await fetch(`${BASE_URL}/benchmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return { status: response.status, json };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const ok = await post(payload);
assert(
  ok.status === 201 &&
    ok.json?.ok === true &&
    ok.json?.id === payload.id &&
    ok.json?.message === payload.message &&
    ok.json?.count === payload.count &&
    (ok.json?.adapter === 'express' || ok.json?.adapter === 'fastify'),
  `valid payload failed: status=${ok.status} body=${JSON.stringify(ok.json)}`,
);

if (EXPECTED_ADAPTER) {
  assert(
    ok.json.adapter === EXPECTED_ADAPTER,
    `expected adapter=${EXPECTED_ADAPTER}, got ${ok.json.adapter}`,
  );
}

console.log(`ok  adapter=${ok.json.adapter}`);
console.log('smoke passed');
