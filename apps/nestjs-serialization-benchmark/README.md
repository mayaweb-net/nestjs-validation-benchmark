# NestJS Serialization Benchmark

Compare **project-wide** response serialization strategies. One endpoint, one mode per process — like switching Express/Fastify via `ADAPTER`.

| `SERIALIZER` | Global setup in `main.ts` | Controller returns |
|---|---|---|
| `default` | No extra interceptor | Plain public object → Nest JSON |
| `class-transformer` | `ClassSerializerInterceptor` | `UserEntity` (`@Exclude()` password) |
| `typia` | `TypiaSerializeInterceptor` | Plain public object → `typia.json.stringify` |
| `manual` | `ManualSerializeInterceptor` | Plain public object → `JSON.stringify` |

```http
GET /benchmark
```

Password never appears on the wire. Serialization is **not** chosen per route in the controller.

## Quick start

```bash
pnpm build:serialization

pnpm start:serialization:default
pnpm smoke:serialization

pnpm start:serialization:class-transformer
pnpm smoke:serialization

pnpm start:serialization:typia
pnpm smoke:serialization

pnpm start:serialization:manual
pnpm smoke:serialization
```

Port: `http://127.0.0.1:3003`

## Microbenchmark

In-process stringify/transform cost (not Nest HTTP):

```bash
pnpm microbenchmark:serialization
```

```bash
$env:SIZE='small'; pnpm microbenchmark:serialization
$env:SIZE='medium'; pnpm microbenchmark:serialization
$env:SIZE='large'; pnpm microbenchmark:serialization
```

Prefer median `ns/op` at the same `SIZE`.

## k6

Start one serializer process, then load the same URL:

```bash
pnpm start:serialization:typia
pnpm benchmark:serialization:typia
```

Scripts:

```bash
pnpm benchmark:serialization:default
pnpm benchmark:serialization:class-transformer
pnpm benchmark:serialization:typia
pnpm benchmark:serialization:manual
```

Analyze p50/p95/p99, achieved rate, errors, and CPU under equal `RATE` / `DURATION`.

## Docker

```bash
$env:SERIALIZER='typia'; docker compose up --build serialization-api -d
pnpm smoke:serialization
```

## Why global, not per-controller?

In real Nest apps you usually pick one serialization approach for the whole API (`APP_INTERCEPTOR` / Nestia style), not a different strategy on each route. This benchmark mirrors that: restart the process with a different `SERIALIZER` to switch the whole app.

## Layout

```text
src/main.ts                          # registers global interceptor from SERIALIZER
src/benchmark/benchmark.controller.ts # single GET /benchmark
src/benchmark/*-serialize.interceptor.ts
scripts/microbenchmark.ts
test/{smoke.mjs,benchmark.js}
```
