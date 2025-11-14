import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TopModelsQueryDto {
  @IsOptional() @IsInt() @Type(() => Number) @Min(1)
  top?: number = 10;

  @IsOptional() @IsInt() @Type(() => Number)
  year?: number;

  @IsOptional() @IsString()
  region?: string;
}

export class TrendQueryDto {
  @IsOptional() @IsInt() @Type(() => Number)
  fromYear?: number;

  @IsOptional() @IsInt() @Type(() => Number)
  toYear?: number;

  @IsOptional() @IsString()
  region?: string;

  @IsOptional() @IsString()
  model?: string;
}
