import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersAdminController } from './users.admin.controller';
import { UsersService } from 'src/services/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersAdminController], // ✅
  exports: [UsersService],
})
export class UsersModule {}
