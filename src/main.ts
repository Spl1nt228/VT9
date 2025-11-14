import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesService } from './roles/roles.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Создаем базовые роли при запуске приложения
  const rolesService = app.get(RolesService);
  await rolesService.seedRoles();
  
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();