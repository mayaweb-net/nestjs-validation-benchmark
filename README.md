# NestJS Benchmarks Monorepo

Collection of isolated NestJS performance experiments. Each app owns its own `src/`, `test/`, `scripts/` (if any), `results/`, and README.

| App | Compares | Port | Docs |
|---|---|---|---|
| [`nestjs-validation-benchmark`](apps/nestjs-validation-benchmark) | class-validator vs Zod vs Typia | 3000 | [README](apps/nestjs-validation-benchmark/README.md) |
| [`nestjs-adapter-benchmark`](apps/nestjs-adapter-benchmark) | Express vs Fastify adapters | 3001 | [README](apps/nestjs-adapter-benchmark/README.md) |
| [`nestjs-serialization-benchmark`](apps/nestjs-serialization-benchmark) | default vs class-transformer vs Typia vs manual JSON | 3003 | [README](apps/nestjs-serialization-benchmark/README.md) |
| [`nestjs-logger-benchmark`](apps/nestjs-logger-benchmark) | silent vs Nest Logger vs console vs nestjs-pino | 3004 | [README](apps/nestjs-logger-benchmark/README.md) |

## Prerequisites

- Node.js 22+
- pnpm
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) for HTTP load tests
- Docker optional

## Install

```bash
pnpm install
```

## Build

```bash
pnpm build
pnpm build:validation
pnpm build:adapter
pnpm build:serialization
pnpm build:logger
```

## Validation (3000)

```bash
pnpm start:validation
pnpm smoke:validation
pnpm microbenchmark:validation
pnpm benchmark:validation:typia
```

## Adapter (3001)

```bash
pnpm start:adapter:express
pnpm start:adapter:fastify
pnpm smoke:adapter
pnpm benchmark:adapter:fastify
```

## Serialization (3003)

```bash
pnpm start:serialization:default
pnpm start:serialization:typia
pnpm smoke:serialization
pnpm benchmark:serialization:typia
```

## Logger (3004)

Fair comparison: same 4-field JSON log line; k6 default **RATE=500**.

```bash
pnpm start:logger:silent
pnpm start:logger:nest
pnpm start:logger:console
pnpm start:logger:pino

pnpm smoke:logger
pnpm benchmark:logger:silent
pnpm benchmark:logger:nest
pnpm benchmark:logger:console
pnpm benchmark:logger:pino
```

Details: [apps/nestjs-logger-benchmark/README.md](apps/nestjs-logger-benchmark/README.md)

## Docker Compose

```bash
docker compose up --build validation-api -d
docker compose up --build adapter-express -d
docker compose up --build adapter-fastify -d
docker compose up --build serialization-api -d
docker compose up --build logger-api -d
```

| Service | Port |
|---|---|
| `validation-api` | 3000 |
| `adapter-express` | 3001 |
| `adapter-fastify` | 3002 |
| `serialization-api` | 3003 |
| `logger-api` | 3004 |
