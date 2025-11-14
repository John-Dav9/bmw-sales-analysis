import { IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSalesQueryDto {
  @IsOptional() @IsInt() @Type(() => Number) @Min(1)
  limit?: number = 100;

  @IsOptional() @IsInt() @Type(() => Number) @Min(0)
  offset?: number = 0;

  @IsOptional() @IsIn(['year_asc','year_desc','price_asc','price_desc','volume_desc'])
  sort?: 'year_asc' | 'year_desc' | 'price_asc' | 'price_desc' | 'volume_desc' = 'year_desc';

  @IsOptional() @IsInt() @Type(() => Number)
  year?: number;

  @IsOptional() @IsString()
  region?: string;

  @IsOptional() @IsString()
  model?: string;
}

export class GetKpiQueryDto {
  @IsOptional() @IsInt() @Type(() => Number)
  year?: number;

  @IsOptional() @IsString()
  region?: string;

  @IsOptional() @IsString()
  model?: string;
}
