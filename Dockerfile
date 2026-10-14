ARG APP=nestjs-validation-benchmark

FROM node:24-bookworm-slim AS build

ARG APP
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec nest build ${APP}

FROM node:24-bookworm-slim AS production

ARG APP
ENV NODE_ENV=production
ENV APP=${APP}
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "node dist/apps/${APP}/main.js"]
