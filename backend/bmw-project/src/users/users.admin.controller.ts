import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UsersService } from 'src/services/users/users.service';
import { UpdateUserDto } from 'src/dto/update-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/users') // => /admin/users
export class UsersAdminController {
  constructor(private users: UsersService) {}

@Post()
async create(@Body() dto: CreateUserDto) {   // ✅ utilise le DTO
  const hash = await bcrypt.hash(dto.password, 10);
  return this.users.create({
    name: dto.name,
    surname: dto.surname,
    email: dto.email,
    password_hash: hash,
    role: dto.role,
  });
}

  @Get()
  async list() {
    // liste simple – tu peux ajouter pagination
    const all = await this.users['repo'].find({ order: { id: 'ASC' } as any });
    return all.map(({ password_hash, ...u }) => u);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto
  ) {
    const patch: any = { ...dto };
    if (dto.password) {
      patch.password_hash = await bcrypt.hash(dto.password, 10);
      delete patch.password;
    }
    if ('role' in patch && patch.role === undefined) delete patch.role;
    await this.users.update(id, patch);
    const { password_hash, ...res } = await this.users.findOne(id) as any;
    return res;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.users.remove(id);
    return { ok: true };
  }

  @Patch(':id/active')
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { is_active: boolean }
  ) {
    const updated = await this.users.setActive(id, !!body.is_active);
    const { password_hash, ...safe } = updated as any;
    return safe;
  }
}
