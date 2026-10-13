import { Module } from '@nestjs/common';
import { BenchmarkModule } from './benchmark/benchmark.module.js';

@Module({
  imports: [BenchmarkModule],
})
export class AppModule {}