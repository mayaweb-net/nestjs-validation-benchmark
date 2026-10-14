# NestJS Benchmarks Monorepo

Collection of isolated NestJS performance experiments. Each app owns its own `src/`, `test/`, `scripts/` (if any), `results/`, and README.

| App | Compares | Docs |
|---|---|---|
| [`nestjs-validation-benchmark`](apps/nestjs-validation-benchmark) | class-validator vs Zod vs Typia | [README](apps/nestjs-validation-benchmark/README.md) |
| [`nestjs-adapter-benchmark`](apps/nestjs-adapter-benchmark) | Express vs Fastify adapters | [README](apps/nestjs-adapter-benchmark/README.md) |

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

Details and how to analyze results: [apps/nestjs-validation-benchmark/README.md](apps/nestjs-validation-benchmark/README.md)

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

Details and how to analyze results: [apps/nestjs-adapter-benchmark/README.md](apps/nestjs-adapter-benchmark/README.md)

## Docker Compose

```bash
docker compose up --build validation-api -d
docker compose up --build adapter-express -d
docker compose up --build adapter-fastify -d
```

| Service | Port | Notes |
|---|---|---|
| `validation-api` | 3000 | Validation libraries comparison |
| `adapter-express` | 3001 | Express adapter |
| `adapter-fastify` | 3002 | Fastify adapter (mapped host 3002 → container 3001) |

## Layout

```text
apps/
  nestjs-validation-benchmark/
  nestjs-adapter-benchmark/
compose.yml
Dockerfile
```

Add a new benchmark by creating another Nest app under `apps/`, giving it local `test/`, `results/`, and a README that documents both how to run and how to interpret results.
