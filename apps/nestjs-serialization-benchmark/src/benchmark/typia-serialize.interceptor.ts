import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import typia from 'typia';
import { Observable, map } from 'rxjs';

import type { UserOutput } from './user.interfaces.js';

/**
 * Project-wide Typia JSON stringify for successful responses.
 * Mirrors using Nestia stringify globally instead of per-route @TypedRoute.
 */
@Injectable()
export class TypiaSerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<string> {
    return next.handle().pipe(
      map((data: UserOutput) => {
        const response = context.switchToHttp().getResponse<{
          setHeader(name: string, value: string): void;
        }>();
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        return typia.json.stringify<UserOutput>(data);
      }),
    );
  }
}
