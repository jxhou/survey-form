import { Module } from '@nestjs/common';
// import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  // controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
