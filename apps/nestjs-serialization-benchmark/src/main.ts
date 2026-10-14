import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ManualSerializeInterceptor } from './benchmark/manual-serialize.interceptor.js';
import { getSerializerMode } from './benchmark/serializer.mode.js';
import { TypiaSerializeInterceptor } from './benchmark/typia-serialize.interceptor.js';

async function bootstrap() {
  const serializer = getSerializerMode();
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  if (serializer === 'class-transformer') {
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  } else if (serializer === 'typia') {
    app.useGlobalInterceptors(new TypiaSerializeInterceptor());
  } else if (serializer === 'manual') {
    app.useGlobalInterceptors(new ManualSerializeInterceptor());
  }

  const port = Number(process.env.PORT ?? 3003);
  console.log(`Server is starting on port ${port} (serializer=${serializer})`);
  await app.listen(port, '0.0.0.0');
  console.log(`Server is started on port ${port} (serializer=${serializer})`);
}

bootstrap();
