import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service'; // 1. 引入这个服务

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService, // 2. 把它加到 providers 里
  ],
})
export class UsersModule {}
