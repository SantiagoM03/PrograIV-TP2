import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Acá devuelvo un mensaje simple de prueba para el endpoint raíz.
  getHello(): string {
    return 'Hello World!';
  }
}
