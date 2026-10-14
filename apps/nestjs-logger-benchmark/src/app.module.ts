import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { BenchmarkController } from './benchmark.controller.js';
import { getLoggerMode } from './logger.mode.js';

const loggerMode = getLoggerMode();

@Module({
  imports:
    loggerMode === 'pino'
      ? [
          LoggerModule.forRoot({
            pinoHttp: {
              level: 'info',
              autoLogging: true,
              quietReqLogger: true,
              // Strip default fat req/res dumps — log the same 4 fields as nest/console.
              serializers: {
                req: () => undefined,
                res: () => undefined,
              },
              customSuccessObject: (req, res, val) => ({
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                durationMs: val.responseTime,
              }),
              customErrorObject: (req, res, _error, val) => ({
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                durationMs: val.responseTime,
              }),
            },
          }),
        ]
      : [],
  controllers: [BenchmarkController],
})
export class AppModule {}
