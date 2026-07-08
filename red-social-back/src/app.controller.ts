import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Acá dejo un endpoint básico para comprobar que la API responde.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
