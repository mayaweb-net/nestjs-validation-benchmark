# NestJS Adapter Benchmark

Compare NestJS HTTP adapters:

- **Express** (`@nestjs/platform-express`)
- **Fastify** (`@nestjs/platform-fastify`)

Same NestJS app, same route, same payload. The only intentional difference is the platform adapter.

This app focuses on **k6 HTTP load tests**. There is no microbenchmark here, because adapter cost shows up in the full request path (HTTP server + Nest adapter + routing + JSON body), not in an isolated function call.

## Endpoint

```http
POST /benchmark
```

Request body (`test/payload.json`):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "adapter-benchmark",
  "count": 42
}
```

Successful response:

```json
{
  "ok": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "adapter-benchmark",
  "count": 42,
  "adapter": "express"
}
```

No validation libraries are used on purpose, so the comparison isolates adapter overhead.

## Prerequisites

- Node.js 22+
- pnpm
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)
- Docker optional

## Quick start

From the monorepo root:

```bash
pnpm install
pnpm build:adapter
```

Run one adapter at a time on port `3001`:

```bash
pnpm start:adapter:express
# or
pnpm start:adapter:fastify
```

Smoke + load:

```bash
pnpm smoke:adapter
pnpm benchmark:adapter:express
# restart with fastify, then:
pnpm smoke:adapter
pnpm benchmark:adapter:fastify
```

Docker:

```bash
docker compose up --build adapter-express -d
pnpm smoke:adapter

docker compose up --build adapter-fastify -d
$env:ADAPTER='fastify'; $env:BASE_URL='http://127.0.0.1:3002'; pnpm smoke:adapter
```

Local single-process URL: `http://127.0.0.1:3001`.  
Docker Fastify is published on host `3002` so it can run beside Express.

## k6 HTTP load test

### Run

```bash
pnpm benchmark:adapter:express
pnpm benchmark:adapter:fastify
```

Or directly:

```bash
k6 run apps/nestjs-adapter-benchmark/test/benchmark.js -e ADAPTER=express -e RATE=100 -e DURATION=1m -e BASE_URL=http://127.0.0.1:3001
k6 run apps/nestjs-adapter-benchmark/test/benchmark.js -e ADAPTER=fastify -e RATE=100 -e DURATION=1m -e BASE_URL=http://127.0.0.1:3001
```

Save raw metrics:

```bash
k6 run --out json=apps/nestjs-adapter-benchmark/results/express.json -e ADAPTER=express apps/nestjs-adapter-benchmark/test/benchmark.js
k6 run --out json=apps/nestjs-adapter-benchmark/results/fastify.json -e ADAPTER=fastify apps/nestjs-adapter-benchmark/test/benchmark.js
```

### Scenario design

Uses k6 `constant-arrival-rate`:

- `RATE`: target iterations/sec (default `100`)
- `DURATION`: default `1m`
- one iteration = one `POST /benchmark`

Keep offered load identical across adapters. Do not compare a fixed-VU Express run against a fixed-VU Fastify run if you care about equal request pressure.

Suggested protocol:

1. Smoke each adapter (`pnpm smoke:adapter` with matching `ADAPTER`)
2. Warm-up ~30s
3. Measure Express and Fastify at the same `RATE` / `DURATION`
4. Repeat 3–5 times and rotate order
5. Optionally sweep rates: 100 → 250 → 500 → 1000 req/s

### How to analyze k6 results

| Metric | What to look for |
|---|---|
| **Achieved iteration rate** | Did both adapters sustain the target `RATE`? |
| **http_req_duration p50 / p95 / p99** | Latency under equal load. Prefer percentiles. |
| **http_req_failed** | Should stay near 0% for this echo endpoint. |
| **checks** | Status `201` and echo body contract. |
| **CPU / memory** | Same container limits (`docker stats`). |

Analysis checklist:

1. Compare only runs with the same `RATE`, `DURATION`, payload, and resources.
2. If one adapter cannot hold the target arrival rate, that is a capacity result.
3. Report p95/p99, not only mean latency.
4. Record CPU/RAM; Fastify may look similar on latency at low rate but use less CPU (or the reverse under your payload).

Latency improvement vs Express baseline:

```text
Improvement (%) = (T_express - T_fastify) / T_express × 100
```

Compute separately for p50/p95/p99. Do not conflate latency improvement with throughput improvement.

## Smoke test

```bash
pnpm smoke:adapter
```

For Fastify:

```bash
$env:ADAPTER='fastify'; pnpm smoke:adapter
```

Expects `201` and an echoed body whose `adapter` field matches the running process.

## Layout

```text
src/                 NestJS app (ADAPTER=express|fastify)
test/benchmark.js    k6 load script
test/payload.json    Shared payload
test/smoke.mjs       Correctness smoke test
results/             Optional k6 JSON outputs
```

## Notes

- Always use production builds (`pnpm start:adapter:express` / `:fastify`).
- Prefer running k6 on a separate machine for serious numbers.
- Do not add validation libraries here if the goal is adapter isolation.
- Port `3001` avoids clashing with the validation app on `3000`.
