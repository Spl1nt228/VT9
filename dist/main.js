"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const roles_service_1 = require("./roles/roles.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const rolesService = app.get(roles_service_1.RolesService);
    await rolesService.seedRoles();
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
