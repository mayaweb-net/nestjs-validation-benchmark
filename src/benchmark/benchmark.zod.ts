import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BenchmarkItemSchema = z.object({
  name: z.string().min(2).max(80),
  quantity: z.number().int().min(1).max(1000),
});

export const BenchmarkSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(18).max(100),
  items: z.array(BenchmarkItemSchema),
});

export class BenchmarkZodDto extends createZodDto(BenchmarkSchema) {}
