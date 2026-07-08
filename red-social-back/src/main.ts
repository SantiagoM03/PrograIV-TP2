/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  /*
    Arranco la app como NestExpressApplication.

    La levanto así porque necesito varias capacidades de Express,
    por ejemplo:

    - servir archivos estáticos;
    - trabajar cómodo con cookies;
    - exponer imágenes subidas al servidor.
  */
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /*
    Acá habilito CORS.

    El frontend Angular corre en:
    http://localhost:4200

    El backend NestJS corre en:
    http://localhost:3000

    Como son puertos distintos, el navegador los considera orígenes distintos.
    Por eso tengo que permitir que Angular pueda hacer peticiones al backend.

    credentials: lo activo para que las cookies viajen bien en ambos sentidos.
  */
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  /*
    Uso cookieParser para poder leer cookies dentro de las requests.

    Ejemplo:
    request.cookies.access_token

    Después lo uso para leer el JWT guardado
    en la cookie "access_token".
  */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  /*
    Dejo la carpeta 'uploads' como carpeta pública.
    Si guardo una imagen ahí, se puede acceder desde localhost:3000.

    Esto me sirve para guardar la imagen
    y también persistir su URL en la base de datos.
  */
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  /*
    Defino un prefijo global para todas las rutas.
  */
  app.setGlobalPrefix('api');

  /*
    Activo ValidationPipe para validar automáticamente los DTOs.
  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Acá limpio campos extra que no estén definidos en el DTO.
      forbidNonWhitelisted: true, // Si llega un campo que no corresponde, devuelvo error 400.
      transform: true, // Acá permito transformar tipos cuando hace falta.
    }),
  );

  /*
    Tomo el puerto desde el archivo .env.

    Si no existe PORT, uso 3000 por defecto.
  */
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`Servidor corriendo en http://localhost:${port}/api`);
}

bootstrap();
