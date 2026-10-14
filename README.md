# NestJS Benchmarks Monorepo

Collection of isolated NestJS performance experiments. Each app owns its own `src/`, `test/`, `scripts/` (if any), `results/`, and README.

| App | Compares | Port | Docs |
|---|---|---|---|
| [`nestjs-validation-benchmark`](apps/nestjs-validation-benchmark) | class-validator vs Zod vs Typia | 3000 | [README](apps/nestjs-validation-benchmark/README.md) |
| [`nestjs-adapter-benchmark`](apps/nestjs-adapter-benchmark) | Express vs Fastify adapters | 3001 | [README](apps/nestjs-adapter-benchmark/README.md) |
| [`nestjs-serialization-benchmark`](apps/nestjs-serialization-benchmark) | default vs class-transformer vs Typia vs manual JSON | 3003 | [README](apps/nestjs-serialization-benchmark/README.md) |

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
pnpm build                 # all apps
pnpm build:validation
pnpm build:adapter
pnpm build:serialization
```

## Validation benchmark (port 3000)

```bash
pnpm start:validation
pnpm smoke:validation
pnpm microbenchmark:validation
pnpm benchmark:validation:class-validator
pnpm benchmark:validation:zod
pnpm benchmark:validation:typia
```

Details: [apps/nestjs-validation-benchmark/README.md](apps/nestjs-validation-benchmark/README.md)

## Adapter benchmark (port 3001)

```bash
pnpm start:adapter:express
pnpm smoke:adapter
pnpm benchmark:adapter:express

pnpm start:adapter:fastify
$env:ADAPTER='fastify'; pnpm smoke:adapter
pnpm benchmark:adapter:fastify
```

Run one adapter process at a time on port `3001` locally. Compose maps Fastify to host `3002` for side-by-side containers.

Details: [apps/nestjs-adapter-benchmark/README.md](apps/nestjs-adapter-benchmark/README.md)

## Serialization benchmark (port 3003)

One process = one global serializer (`SERIALIZER` env), same as adapter modes:

```bash
pnpm start:serialization:default
pnpm start:serialization:class-transformer
pnpm start:serialization:typia
pnpm start:serialization:manual

pnpm smoke:serialization
pnpm microbenchmark:serialization
pnpm benchmark:serialization:default
pnpm benchmark:serialization:class-transformer
pnpm benchmark:serialization:typia
pnpm benchmark:serialization:manual
```

Details: [apps/nestjs-serialization-benchmark/README.md](apps/nestjs-serialization-benchmark/README.md)

## Docker Compose

```bash
docker compose up --build validation-api -d
docker compose up --build adapter-express -d
docker compose up --build adapter-fastify -d
docker compose up --build serialization-api -d
```

| Service | Port | Notes |
|---|---|---|
| `validation-api` | 3000 | Validation libraries |
| `adapter-express` | 3001 | Express adapter |
| `adapter-fastify` | 3002 | Fastify adapter (host 3002 → container 3001) |
| `serialization-api` | 3003 | Response serialization modes |

## Layout

```text
apps/
  nestjs-validation-benchmark/
  nestjs-adapter-benchmark/
  nestjs-serialization-benchmark/
compose.yml
Dockerfile
```
