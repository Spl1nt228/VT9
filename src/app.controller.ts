import { Controller, Get } from '@nestjs/common';
// ...existing code...
@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/health')
  getHealth(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'docker-lab'
    };
  }
}