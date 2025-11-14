import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(name: string) {
    return this.prisma.role.create({
      data: { name },
    });
  }

  async updateRole(id: number, name: string) {
    return this.prisma.role.update({
      where: { id },
      data: { name },
    });
  }

  async assignUserRole(userId: number, roleId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
      include: {
        roles: true,
      },
    });
  }

  async removeUserRole(userId: number, roleId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
      include: {
        roles: true,
      },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany();
  }

  async getUsersWithRoles() {
    return this.prisma.user.findMany({
      include: {
        roles: true,
      },
    });
  }

  async seedRoles() {
    // Проверим, существуют ли роли
    const existingRoles = await this.prisma.role.findMany();
    
    if (existingRoles.length === 0) {
      // Создаем базовые роли
      await this.prisma.role.createMany({
        data: [
          { name: 'user' },
          { name: 'admin' },
        ],
      });
      console.log('Роли user и admin созданы');
    }
  }
}