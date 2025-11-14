import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsIn(['admin', 'visitor'])
  role!: 'admin' | 'visitor';

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  surname!: string;
}
