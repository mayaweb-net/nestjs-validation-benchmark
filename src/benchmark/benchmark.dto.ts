import {
  IsArray,
  IsEmail,
  IsInt,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BenchmarkItemDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  quantity!: number;
}

export class BenchmarkDto {
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(2, 100)
  name!: string;

  @IsInt()
  @Min(18)
  @Max(100)
  age!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenchmarkItemDto)
  items!: BenchmarkItemDto[];
}
