import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<any[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any | null> {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`Пользователь с id=${id} не найден`);
    }
    return user;
  }

  // Создание пользователей происходит через /auth/register
  // @Post()
  // create(@Body() data: { username: string; email: string; password: string }): Promise<any> {
  //   return this.usersService.create(data);
  // }
}