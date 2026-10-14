import { Module } from '@nestjs/common';
import { BenchmarkController } from './benchmark.controller.js';

@Module({
  controllers: [BenchmarkController],
})
export class AppModule {}
