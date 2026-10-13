import 'reflect-metadata';
import { performance } from 'node:perf_hooks';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import typia from 'typia';

import { BenchmarkDto } from '../src/benchmark/benchmark.dto.js';
import type { BenchmarkInput } from '../src/benchmark/benchmark.interfaces.js';
import { BenchmarkSchema } from '../src/benchmark/benchmark.zod.js';

type PayloadSize = 'small' | 'medium' | 'large';
type CaseName = 'class-validator' | 'zod' | 'typia';

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

function makeInput(itemCount: number): BenchmarkInput {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'benchmark@example.com',
    name: 'Benchmark User',
    age: 28,
    items: Array.from({ length: itemCount }, (_, i) => ({
      name: `Item ${i + 1}`,
      quantity: (i % 1000) + 1,
    })),
  };
}

const input = makeInput(SIZES[sizeName]);

type Case = {
  name: CaseName;
  run: () => void;
};

const cases: Case[] = [
  {
    name: 'class-validator',
    run: () => {
      const dto = plainToInstance(BenchmarkDto, input);
      const errors = validateSync(dto);
      if (errors.length > 0) {
        throw new Error('Unexpected class-validator error');
      }
    },
  },
  {
    name: 'zod',
    run: () => {
      const result = BenchmarkSchema.safeParse(input);
      if (!result.success) {
        throw new Error('Unexpected zod error');
      }
    },
  },
  {
    name: 'typia',
    run: () => {
      const result = typia.validate<BenchmarkInput>(input);
      if (!result.success) {
        throw new Error('Unexpected typia error');
      }
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
    items: input.items.length,
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
for (const name of ['class-validator', 'zod', 'typia'] as const) {
  const samples = results
    .filter((result) => result.name === name)
    .map((result) => result.nsPerOperation);
  console.log({ name, size: sizeName, medianNsPerOperation: median(samples) });
}
