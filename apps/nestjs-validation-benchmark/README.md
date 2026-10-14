# NestJS Validation Benchmark

Compare **class-validator**, **Zod** (`nestjs-zod`), and **Typia** (`@nestia/core`) under NestJS.

This app runs two complementary experiments:

| Experiment | What it measures | Tool |
|---|---|---|
| **Microbenchmark** | Raw validation cost only | Node script |
| **HTTP load test** | End-to-end API performance under load | [k6](https://k6.io) |

Use both. Microbenchmark answers *why* one library is faster. k6 answers *how much that matters* in a real NestJS HTTP path.

## Endpoints

All three routes accept the same JSON payload and return the same shape:

```http
POST /benchmark/class-validator
POST /benchmark/zod
POST /benchmark/typia
```

Successful response:

```json
{ "valid": true, "itemCount": 3 }
```

Validation rules are kept equivalent across libraries:

- UUID `id`
- email
- `name` length bounds
- integer `age` range
- nested `items[]` with name/quantity constraints

Each route uses only its own validation path (no shared global `ValidationPipe`), so results are not mixed by pipe interference.

## Prerequisites

- Node.js 22+
- pnpm
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) installed on the host for HTTP tests
- Docker optional (API container)

## Quick start

From the monorepo root:

```bash
pnpm install
pnpm build:validation
pnpm start:validation
```

In another terminal:

```bash
pnpm smoke:validation
pnpm microbenchmark:validation
pnpm benchmark:validation:class-validator
pnpm benchmark:validation:zod
pnpm benchmark:validation:typia
```

Docker:

```bash
docker compose up --build validation-api -d
pnpm smoke:validation
```

Default URL: `http://127.0.0.1:3000`.

---

## 1. Microbenchmark

Measures validation only: no HTTP, no NestJS routing, no JSON transport.

| Library | Operation under test |
|---|---|
| class-validator | `plainToInstance` + `validateSync` |
| Zod | `BenchmarkSchema.safeParse` |
| Typia | `typia.validate<T>` |

### Run

```bash
pnpm microbenchmark:validation
```

Payload size:

```bash
# PowerShell
$env:SIZE='small'; pnpm microbenchmark:validation    # 3 items
$env:SIZE='medium'; pnpm microbenchmark:validation   # 20 items (default)
$env:SIZE='large'; pnpm microbenchmark:validation    # 100 items
```

Optional knobs:

```bash
$env:ITERATIONS='200000'
$env:WARMUP='20000'
$env:ROUNDS='3'
```

### Output fields

| Field | Meaning |
|---|---|
| `nsPerOperation` | Nanoseconds per validation call |
| `operationsPerSecond` | Throughput of validation calls |
| `totalMs` | Wall time for all iterations in that round |
| `medianNsPerOperation` | Median across rounds (preferred summary metric) |

Rounds rotate library order to reduce JIT / cache bias.

### How to analyze microbenchmark results

1. **Prefer median `ns/op`**, not a single round and not only ops/sec.
2. **Compare libraries on the same `SIZE`**. Larger nested arrays increase absolute cost for all libraries; relative gaps may also change.
3. **Treat lower `ns/op` as faster.** Example interpretation:
   - Typia at ~255 ns/op
   - Zod at ~5,400 ns/op (~21× slower than Typia)
   - class-validator at ~65,000 ns/op (~255× slower than Typia)
4. **Check stability across rounds.** If values jump a lot, re-run with more rounds or a quieter machine.
5. **Do not claim API capacity from these numbers alone.** This isolates validator cost. NestJS + HTTP will dilute the gap.

What this experiment is good for:

- Ranking raw validation overhead
- Explaining *why* one library should win under CPU-bound validation

What it is not:

- A substitute for load testing
- A measure of DX, ecosystem, or OpenAPI tooling

---

## 2. k6 HTTP load test

Measures the full request path:

JSON parse → NestJS → validation pipe/decorator → handler → response → network

Under a **fixed arrival rate**, so each library sees the same offered load.

### Run

Start the API in production mode first (`pnpm start:validation` or Docker), then:

```bash
pnpm benchmark:validation:class-validator
pnpm benchmark:validation:zod
pnpm benchmark:validation:typia
```

Or directly:

```bash
k6 run apps/nestjs-validation-benchmark/test/benchmark.js -e VALIDATOR=class-validator -e RATE=100 -e DURATION=1m -e BASE_URL=http://127.0.0.1:3000
k6 run apps/nestjs-validation-benchmark/test/benchmark.js -e VALIDATOR=zod -e RATE=100 -e DURATION=1m -e BASE_URL=http://127.0.0.1:3000
k6 run apps/nestjs-validation-benchmark/test/benchmark.js -e VALIDATOR=typia -e RATE=100 -e DURATION=1m -e BASE_URL=http://127.0.0.1:3000
```

Save raw metrics into this app's `results/`:

```bash
k6 run --out json=apps/nestjs-validation-benchmark/results/class-validator.json -e VALIDATOR=class-validator apps/nestjs-validation-benchmark/test/benchmark.js
k6 run --out json=apps/nestjs-validation-benchmark/results/zod.json -e VALIDATOR=zod apps/nestjs-validation-benchmark/test/benchmark.js
k6 run --out json=apps/nestjs-validation-benchmark/results/typia.json -e VALIDATOR=typia apps/nestjs-validation-benchmark/test/benchmark.js
```

While a run is in progress, optionally watch container resources:

```bash
docker stats validation-benchmark-api
```

### Scenario design

The script uses k6 `constant-arrival-rate`:

- `RATE`: target iterations started per second (default `100`)
- `DURATION`: test length (default `1m`)
- one iteration = one POST with `test/payload.json`

Fixed arrival rate keeps offered load comparable. A fixed VU count would let a faster API generate more requests and bias the comparison.

Suggested protocol:

1. Smoke test (`pnpm smoke:validation`)
2. Short warm-up (~30s light load)
3. Measure each validator at the same `RATE` / `DURATION`
4. Repeat 3–5 times and rotate order
5. Optionally sweep rates: 50 → 100 → 250 → 500 req/s

### How to analyze k6 results

Focus on these metrics from the k6 summary:

| Metric | What to look for |
|---|---|
| **http_reqs** / actual iteration rate | Did the run sustain the target `RATE`? If not, the API or VU pool saturated. |
| **http_req_duration p50 / p95 / p99** | Latency distribution. Prefer percentiles over mean. |
| **http_req_failed** | Should stay near 0% for the valid-payload scenario. |
| **checks** | Status `201` and response body contract must pass. |
| **CPU / memory** (`docker stats`) | Resource cost under the same load. |

Analysis checklist:

1. **Same load first.** Only compare runs with the same `RATE`, `DURATION`, payload, and machine/container limits.
2. **Confirm achieved throughput.** If Typia holds 100 iter/s and class-validator drops below target, that is itself a capacity result.
3. **Read p95/p99, not only average.** Tail latency matters under load.
4. **Separate validation failures from HTTP failures.** For invalid-payload experiments, `400` is expected success of the test design, not an `http_req_failed` story unless you tagged it that way.
5. **Record CPU/RAM.** A library can look similar on latency while using more CPU headroom.

Latency improvement vs a baseline (example: class-validator → typia):

```text
Improvement (%) = (T_baseline - T_candidate) / T_baseline × 100
```

Compute that separately for p50, p95, or p99. Throughput improvement is a different claim; do not mix the two.

What this experiment is good for:

- Realistic NestJS API comparison
- Capacity / latency under equal offered load

What it is not:

- A precise microsecond measurement of validator internals

---

## 3. Reading both experiments together

| Microbenchmark | k6 HTTP | Interpretation |
|---|---|---|
| Large gap | Large gap | Validation cost dominates the request path under your payload/load. |
| Large gap | Small gap | Validator differs a lot, but NestJS/IO overhead masks most of it at this rate/payload. |
| Small gap | Large gap | Difference is probably elsewhere (serialization, event loop saturation, config), not raw validation. |
| Same ranking in both | — | Stronger evidence for publishing / architecture decisions. |

Practical recommendation:

1. Run microbenchmark for `small` / `medium` / `large`.
2. Run k6 at equal rates for all three endpoints.
3. Report both tables. State versions of Node, NestJS, class-validator, Zod, Typia/Nestia, and k6.

## Smoke test

```bash
pnpm smoke:validation
```

Checks valid payload → `201` and invalid payload → `400` for all three validators.

## Layout

```text
src/benchmark/     NestJS endpoints + shared schemas/DTOs
scripts/           Microbenchmark
test/benchmark.js  k6 load script
test/payload.json  Shared valid payload
test/smoke.mjs     Correctness smoke test
results/           Optional k6 JSON outputs
```

## Notes

- Always benchmark production builds (`pnpm start:validation`), not `start:dev`.
- Prefer running k6 on a different machine from the API for serious numbers.
- Keep validation rules and payloads identical across libraries; otherwise the comparison is invalid.
- `nestjs-zod` currently declares Nest peer ranges that may lag Nest 12; this project pins working versions for the benchmark harness.
