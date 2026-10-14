import { Controller, Get } from '@nestjs/common';

@Controller('benchmark')
export class BenchmarkController {
  @Get()
  ping() {
    return {
      ok: true,
      message: 'logger-benchmark',
    };
  }
}
