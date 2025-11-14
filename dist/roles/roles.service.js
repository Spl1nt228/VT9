"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRole(name) {
        return this.prisma.role.create({
            data: { name },
        });
    }
    async updateRole(id, name) {
        return this.prisma.role.update({
            where: { id },
            data: { name },
        });
    }
    async assignUserRole(userId, roleId) {
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
    async removeUserRole(userId, roleId) {
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
        const existingRoles = await this.prisma.role.findMany();
        if (existingRoles.length === 0) {
            await this.prisma.role.createMany({
                data: [
                    { name: 'user' },
                    { name: 'admin' },
                ],
            });
            console.log('Роли user и admin созданы');
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
