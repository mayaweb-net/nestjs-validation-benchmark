# NestJS Logger Benchmark

Compare **request-logging** strategies under NestJS. One endpoint, one logger mode per process (`LOGGER` env).

| `LOGGER` | What runs on each request |
|---|---|
| `silent` | No request log (baseline) |
| `nest` | Nest `Logger.log(JSON)` — same 4 fields |
| `console` | `console.log(JSON)` — same 4 fields |
| `pino` | `nestjs-pino` + `pino-http` — same 4 fields only |

Shared log payload for fair comparison:

```json
{ "method": "GET", "url": "/benchmark", "statusCode": 200, "durationMs": 0.42 }
```

```http
GET /benchmark
```

## Quick start

```bash
pnpm build:logger

pnpm start:logger:silent
pnpm start:logger:nest
pnpm start:logger:console
pnpm start:logger:pino

pnpm smoke:logger
```

Port: `http://127.0.0.1:3004`

## k6 (default RATE=500)

Defaults are higher than other apps on purpose — at 100 req/s logger gaps often hide in noise.

```bash
pnpm benchmark:logger:silent
pnpm benchmark:logger:nest
pnpm benchmark:logger:console
pnpm benchmark:logger:pino
```

Override if needed:

```bash
k6 run apps/nestjs-logger-benchmark/test/benchmark.js -e LOGGER=pino -e RATE=1000 -e DURATION=1m -e BASE_URL=http://127.0.0.1:3004
```

### How to analyze

1. Confirm achieved rate ≈ target (if not, that mode saturated).
2. Compare p50 / p95 / p99 under the **same** RATE.
3. `silent` is the floor; the gap to each logger is logging overhead.
4. Repeat 3× and use median p95.

## What changed for fairness

- All modes log the **same four fields** (no fat `req`/`res` dumps from pino-http).
- Nest framework bootstrap logger is off during the run (`logger: false`); only request lines count.
- Default k6 load is **500 iter/s** with higher `maxVUs`.

## Docker

```bash
$env:LOGGER='pino'; docker compose up --build logger-api -d
pnpm smoke:logger
```
