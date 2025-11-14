import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ include: { tasks: true, roles: true } });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id }, include: { tasks: true, roles: true } });
  }

  async create(data: { username: string; email: string; password: string }) {
    return this.prisma.user.create({ data, include: { tasks: true, roles: true } });
  }

  async findByName(username: string) {
    return this.prisma.user.findUnique({ where: { username }, include: { tasks: true, roles: true } });
  }
}