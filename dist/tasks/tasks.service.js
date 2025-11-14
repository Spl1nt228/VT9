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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                completed: dto.completed ?? false,
                user: { connect: { id: dto.userId } },
            },
            include: { user: true },
        });
    }
    findAll() {
        return this.prisma.task.findMany({ include: { user: true } });
    }
    findAllByUser(userId) {
        return this.prisma.task.findMany({ where: { userId }, include: { user: true } });
    }
    findOne(id) {
        return this.prisma.task.findUnique({ where: { id }, include: { user: true } });
    }
    async update(id, dto) {
        const existing = await this.prisma.task.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Task not found');
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.completed !== undefined)
            data.completed = dto.completed;
        if (dto.userId !== undefined)
            data.user = { connect: { id: dto.userId } };
        return this.prisma.task.update({ where: { id }, data, include: { user: true } });
    }
    remove(id) {
        return this.prisma.task.delete({ where: { id } });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
