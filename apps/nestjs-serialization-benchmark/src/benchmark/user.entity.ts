import { Exclude, Type } from 'class-transformer';
import { makeSampleUser, type SampleItem, type SampleUser } from './sample-data.js';

export class UserItemEntity {
  name!: string;
  quantity!: number;
}

export class UserEntity {
  id!: string;
  email!: string;
  name!: string;
  age!: number;

  @Exclude()
  password!: string;

  @Type(() => UserItemEntity)
  items!: UserItemEntity[];

  static fromSample(sample: SampleUser = makeSampleUser()): UserEntity {
    const entity = new UserEntity();
    entity.id = sample.id;
    entity.email = sample.email;
    entity.name = sample.name;
    entity.age = sample.age;
    entity.password = sample.password;
    entity.items = sample.items.map((item: SampleItem) => {
      const row = new UserItemEntity();
      row.name = item.name;
      row.quantity = item.quantity;
      return row;
    });
    return entity;
  }
}
