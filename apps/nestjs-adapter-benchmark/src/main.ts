import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const adapter = (process.env.ADAPTER || 'express').toLowerCase();
  const port = Number(process.env.PORT ?? 3001);

  if (adapter !== 'express' && adapter !== 'fastify') {
    throw new Error(`ADAPTER must be "express" or "fastify", got "${adapter}"`);
  }

  console.log(`Server is starting on port ${port} (adapter=${adapter})`);

  if (adapter === 'fastify') {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
      { logger: false },
    );
    await app.listen(port, '0.0.0.0');
  } else {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(port, '0.0.0.0');
  }

  console.log(`Server is started on port ${port} (adapter=${adapter})`);
}

bootstrap();
