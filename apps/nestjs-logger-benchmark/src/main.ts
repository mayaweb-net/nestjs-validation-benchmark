import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { getLoggerMode } from './logger.mode.js';
import { createRequestLogMiddleware } from './request-log.middleware.js';

async function bootstrap() {
  const loggerMode = getLoggerMode();
  const port = Number(process.env.PORT ?? 3004);

  console.log(`Server is starting on port ${port} (logger=${loggerMode})`);

  if (loggerMode === 'pino') {
    // bufferLogs + useLogger = official nestjs-pino setup.
    // Request-line cost is still dominated by pino-http autoLogging (fair vs middleware).
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
      logger: false,
    });
    app.useLogger(app.get(PinoLogger));
    await app.listen(port, '0.0.0.0');
  } else if (loggerMode === 'silent') {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(port, '0.0.0.0');
  } else {
    // nest | console — no Nest framework noise; only our one request log line.
    const app = await NestFactory.create(AppModule, { logger: false });
    app.use(createRequestLogMiddleware(loggerMode));
    await app.listen(port, '0.0.0.0');
  }

  console.log(`Server is started on port ${port} (logger=${loggerMode})`);
}

bootstrap();
