import { IsEmail, IsIn, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() name?: string;
  @IsOptional() surname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['admin', 'visitor'])
  role?: 'admin' | 'visitor';
}
