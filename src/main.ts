import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const port = Number(process.env.PORT ?? 3000);
  console.log(`Server is starting on port ${port}`);
  await app.listen(port, '0.0.0.0');
  console.log(`Server is started on port ${port}`);
}

bootstrap();
