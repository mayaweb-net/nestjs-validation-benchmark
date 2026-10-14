import { Controller, Get } from '@nestjs/common';

import { makeSampleUser, toPublicUser } from './sample-data.js';
import { getSerializerMode } from './serializer.mode.js';
import { UserEntity } from './user.entity.js';

const sample = makeSampleUser(20);

@Controller('benchmark')
export class BenchmarkController {
  /**
   * Single project endpoint. Serialization strategy is chosen globally via
   * SERIALIZER env in main.ts (interceptor), not per-route decorators.
   */
  @Get()
  getUser() {
    if (getSerializerMode() === 'class-transformer') {
      return UserEntity.fromSample(sample);
    }
    return toPublicUser(sample);
  }
}
