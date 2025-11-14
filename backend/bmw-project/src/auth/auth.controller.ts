import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    // CreateUserDto: { name, surname, email, password, role }
    // -> Laisse l’AuthService (et UsersService) gérer le hash, la création et le token
    return this.authService.register({
      name: dto.name,
      surname: dto.surname,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });
  }
}
