import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Project-wide manual JSON.stringify for successful responses.
 */
@Injectable()
export class ManualSerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<string> {
    return next.handle().pipe(
      map((data: unknown) => {
        const response = context.switchToHttp().getResponse<{
          setHeader(name: string, value: string): void;
        }>();
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        return JSON.stringify(data);
      }),
    );
  }
}
