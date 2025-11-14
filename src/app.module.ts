import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [PrismaModule, UsersModule, TasksModule, AuthModule, RolesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}