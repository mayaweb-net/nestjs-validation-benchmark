import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { TypedBody } from '@nestia/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { BenchmarkDto } from './benchmark.dto.js';
import type { BenchmarkInput } from './benchmark.interfaces.js';
import { BenchmarkZodDto } from './benchmark.zod.js';

@Controller('benchmark')
export class BenchmarkController {
  @Post('class-validator')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  )
  validateWithClassValidator(@Body() input: BenchmarkDto) {
    return {
      valid: true,
      itemCount: input.items.length,
    };
  }

  @Post('zod')
  @UsePipes(new ZodValidationPipe())
  validateWithZod(@Body() input: BenchmarkZodDto) {
    return {
      valid: true,
      itemCount: input.items.length,
    };
  }

  @Post('typia')
  validateWithTypia(@TypedBody() input: BenchmarkInput) {
    return {
      valid: true,
      itemCount: input.items.length,
    };
  }
}
