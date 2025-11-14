import { Injectable, UnauthorizedException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { username: string; email: string; password: string }) {
    // Basic validation
    console.log('AuthService.register called with', { username: data?.username, email: data?.email && '[redacted]' });
    if (!data?.username || !data?.email || !data?.password) {
      console.log('AuthService.register validation failed');
      throw new BadRequestException('username, email and password are required');
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

      // by default assign 'user' role if exists
      const role = await this.prisma.role.findUnique({ where: { name: 'user' } });
      if (role) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { roles: { connect: { id: role.id } } },
        });
      }

      return { id: user.id, username: user.username, email: user.email };
    } catch (err: any) {
      // log full error for debug (will appear in container logs)
      console.error('AuthService.register error:', err);
      // Prisma unique constraint error code
      if (err?.code === 'P2002') {
        // find which field caused the conflict (if available)
        const target = err?.meta?.target?.join(', ') || 'unique field';
        throw new ConflictException(`${target} already exists`);
      }

      // For other known Prisma errors we can return a 500 with message
      // but avoid leaking internals — log and return generic message
      // (Nest will log the error stack in dev)
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByName(username);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (match) {
      // remove password before returning
      // user object is prisma client result, include password
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, roles: user.roles?.map((r) => r.name) };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}