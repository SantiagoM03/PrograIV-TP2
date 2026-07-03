import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  /*
    Creamos la aplicación como NestExpressApplication.

    Seteo la aplicación como NestExpressApplication porque necesito
    funcionalidades propias de Express para trabajar mejor ciertas cosas, por ejemplo:

    - servir archivos estáticos;
    - trabajar cómodamente con cookies;
    - exponer imágenes subidas al servidor.
  */
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /*
    Habilitamos CORS.

    El frontend Angular corre en:
    http://localhost:4200

    El backend NestJS corre en:
    http://localhost:3000

    Como son puertos distintos, el navegador los considera orígenes distintos.
    Por eso necesitamos permitir que Angular pueda hacer peticiones al backend.

    credentials: Para poder trabajar tranquilo con cookies, sino el navegador no las envia ni las recibe bien.
  */
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  /*
    cookieParser permite leer cookies dentro de las requests.

    Ejemplo:
    request.cookies.access_token

    Lo vamos a usar más adelante para leer el JWT guardado
    en la cookie "access_token".
  */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  /*
    Seteo la carpeta 'uploads' como carpeta pública.
    Si guardo una imagen en 'uploads', se va a poder acceder desde localhost:3000

    Esto es necesario para guardar la imagen
    y guardar la URL de la imagen en la base de datos.
  */
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  /*
    Prefijo global para todas las rutas.
  */
  app.setGlobalPrefix('api');

  /*
    ValidationPipe activa las validaciones automáticas en los DTOs.
  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos extra que no estén definidos en el DTO.
      forbidNonWhitelisted: true, //Si el frontend manda campos que no corresponden, devuelve error 400.
      transform: true, //Permite transformar tipos cuando sea necesario.
    }),
  );

  /*
    Tomamos el puerto desde el archivo .env.

    Si no existe PORT, usamos 3000 por defecto.
  */
  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`Servidor corriendo en http://localhost:${port}/api`);
}

bootstrap();
