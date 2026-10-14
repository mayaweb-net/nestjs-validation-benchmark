import 'reflect-metadata';
import { performance } from 'node:perf_hooks';
import { instanceToPlain } from 'class-transformer';
import typia from 'typia';

import { makeSampleUser, toPublicUser } from '../src/benchmark/sample-data.js';
import { UserEntity } from '../src/benchmark/user.entity.js';
import type { UserOutput } from '../src/benchmark/user.interfaces.js';

type PayloadSize = 'small' | 'medium' | 'large';
type CaseName = 'default' | 'class-transformer' | 'typia' | 'manual';

const SIZES: Record<PayloadSize, number> = {
  small: 3,
  medium: 20,
  large: 100,
};

const iterations = Number(process.env.ITERATIONS || 200_000);
const warmup = Number(process.env.WARMUP || 20_000);
const rounds = Number(process.env.ROUNDS || 3);
const sizeName = (process.env.SIZE || 'medium') as PayloadSize;

if (!(sizeName in SIZES)) {
  throw new Error(`SIZE must be one of: ${Object.keys(SIZES).join(', ')}`);
}

const sample = makeSampleUser(SIZES[sizeName]);
const publicUser = toPublicUser(sample);
const entity = UserEntity.fromSample(sample);

type Case = {
  name: CaseName;
  run: () => void;
};

const cases: Case[] = [
  {
    name: 'default',
    run: () => {
      const json = JSON.stringify(publicUser);
      if (json.length < 10) throw new Error('Unexpected default serialize');
    },
  },
  {
    name: 'class-transformer',
    run: () => {
      const plain = instanceToPlain(entity);
      const json = JSON.stringify(plain);
      if (json.includes('password')) {
        throw new Error('password leaked in class-transformer output');
      }
    },
  },
  {
    name: 'typia',
    run: () => {
      const json = typia.json.stringify<UserOutput>(publicUser);
      if (json.length < 10) throw new Error('Unexpected typia serialize');
    },
  },
  {
    name: 'manual',
    run: () => {
      const json = JSON.stringify(publicUser);
      if (json.length < 10) throw new Error('Unexpected manual serialize');
    },
  },
];

function measure(testCase: Case) {
  for (let i = 0; i < warmup; i++) {
    testCase.run();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    testCase.run();
  }
  const elapsedMs = performance.now() - start;

  return {
    name: testCase.name,
    size: sizeName,
    items: sample.items.length,
    iterations,
    totalMs: Number(elapsedMs.toFixed(2)),
    nsPerOperation: Math.round((elapsedMs * 1_000_000) / iterations),
    operationsPerSecond: Math.round(iterations / (elapsedMs / 1000)),
  };
}

const results = [];

for (let round = 0; round < rounds; round++) {
  const ordered = [...cases];
  for (let i = 0; i < round % cases.length; i++) {
    ordered.push(ordered.shift()!);
  }

  console.log(`\nround ${round + 1}/${rounds}`);

  for (const testCase of ordered) {
    const result = measure(testCase);
    results.push({ round: round + 1, ...result });
    console.log(result);
  }
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

console.log('\nmedian ns/op');
for (const name of ['default', 'class-transformer', 'typia', 'manual'] as const) {
  const samples = results
    .filter((result) => result.name === name)
    .map((result) => result.nsPerOperation);
  console.log({ name, size: sizeName, medianNsPerOperation: median(samples) });
}
