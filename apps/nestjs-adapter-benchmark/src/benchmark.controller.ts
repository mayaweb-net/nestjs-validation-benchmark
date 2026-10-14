import { Body, Controller, Post } from '@nestjs/common';

type BenchmarkBody = {
  id: string;
  message: string;
  count: number;
};

@Controller('benchmark')
export class BenchmarkController {
  @Post()
  echo(@Body() body: BenchmarkBody) {
    return {
      ok: true,
      id: body.id,
      message: body.message,
      count: body.count,
      adapter: process.env.ADAPTER || 'express',
    };
  }
}
