import { Controller, Post, Body, UseGuards, Patch, Param, Get, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Только администратор может создавать роли
  @Post()
  async createRole(@Body() createRoleDto: { name: string }) {
    return this.rolesService.createRole(createRoleDto.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Только администратор может обновлять роли
  @Patch(':id')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: { name: string }) {
    return this.rolesService.updateRole(+id, updateRoleDto.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Только администратор может назначать роли пользователям
  @Post('assign-user-role')
  async assignUserRole(@Body() assignRoleDto: { userId: number; roleId: number }) {
    return this.rolesService.assignUserRole(assignRoleDto.userId, assignRoleDto.roleId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Только администратор может удалять роли у пользователей
  @Delete('remove-user-role')
  async removeUserRole(@Body() removeRoleDto: { userId: number; roleId: number }) {
    return this.rolesService.removeUserRole(removeRoleDto.userId, removeRoleDto.roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users-with-roles')
  async getUsersWithRoles() {
    return this.rolesService.getUsersWithRoles();
  }
}