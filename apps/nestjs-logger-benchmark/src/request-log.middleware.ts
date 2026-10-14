import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { formatRequestLogLine } from './log-line.js';
import type { LoggerMode } from './logger.mode.js';

const nestLogger = new Logger('HTTP');

/**
 * One JSON request log line per finished response.
 * Payload matches pino mode (method, url, statusCode, durationMs).
 */
export function createRequestLogMiddleware(mode: LoggerMode) {
  return (req: Request, res: Response, next: NextFunction) => {
    const started = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
      const line = formatRequestLogLine({
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(3)),
      });

      if (mode === 'console') {
        console.log(line);
        return;
      }

      if (mode === 'nest') {
        nestLogger.log(line);
      }
    });

    next();
  };
}
