import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/services/users/users.service';
import { UsersAdminController } from 'src/users/users.admin.controller';


@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersAdminController],
  exports: [UsersService],
})
export class UsersModule {}
