import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const __dirname = dirname(fileURLToPath(import.meta.url));
const payload = JSON.parse(readFileSync(join(__dirname, 'payload.json'), 'utf8'));

const invalidPayload = {
  ...payload,
  age: 'abc',
  items: [{ name: 'x', quantity: 0 }],
};

async function post(path, body) {
  const response = await fetch(`${BASE_URL}/benchmark/${path}`, {
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

const validators = ['class-validator', 'zod', 'typia'];

for (const validator of validators) {
  const ok = await post(validator, payload);
  assert(
    ok.status === 201 && ok.json?.valid === true && ok.json?.itemCount === payload.items.length,
    `${validator} valid payload failed: status=${ok.status} body=${JSON.stringify(ok.json)}`,
  );

  const bad = await post(validator, invalidPayload);
  assert(
    bad.status === 400,
    `${validator} invalid payload expected 400, got ${bad.status}: ${JSON.stringify(bad.json)}`,
  );

  console.log(`ok  ${validator}`);
}

console.log('smoke passed');
