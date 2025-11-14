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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersService, prisma, jwtService) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(data) {
        console.log('AuthService.register called with', { username: data?.username, email: data?.email && '[redacted]' });
        if (!data?.username || !data?.email || !data?.password) {
            console.log('AuthService.register validation failed');
            throw new common_1.BadRequestException('username, email and password are required');
        }
        const saltRounds = 10;
        console.log('AuthService.register hashing password...');
        const hash = await bcrypt.hash(data.password, saltRounds);
        console.log('AuthService.register password hashed');
        try {
            console.log('AuthService.register creating user in DB...');
            const user = await this.prisma.user.create({
                data: { username: data.username, email: data.email, password: hash },
            });
            console.log('AuthService.register user created, id=', user.id);
            const role = await this.prisma.role.findUnique({ where: { name: 'user' } });
            if (role) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { roles: { connect: { id: role.id } } },
                });
            }
            return { id: user.id, username: user.username, email: user.email };
        }
        catch (err) {
            console.error('AuthService.register error:', err);
            if (err?.code === 'P2002') {
                const target = err?.meta?.target?.join(', ') || 'unique field';
                throw new common_1.ConflictException(`${target} already exists`);
            }
            throw new common_1.InternalServerErrorException('Failed to create user');
        }
    }
    async validateUser(username, pass) {
        const user = await this.usersService.findByName(username);
        if (!user)
            return null;
        const match = await bcrypt.compare(pass, user.password);
        if (match) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { username: user.username, sub: user.id, roles: user.roles?.map((r) => r.name) };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
