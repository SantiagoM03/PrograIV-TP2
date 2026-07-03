/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/*
  Tipo mínimo para representar una imagen subida con Multer.

  Usamos memoryStorage, por lo tanto el archivo NO se guarda automáticamente
  en uploads/users.

  Multer nos entrega el archivo en memoria mediante "buffer".
  Después AuthService decide cuándo guardarlo realmente.
*/
interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/*
  Controller de autenticación.

  Como en main.ts tenemos:
  app.setGlobalPrefix('api')

  Y acá:
  @Controller('auth')

  Las rutas finales son:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
*/
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
    Registro de usuario.

    Recibe multipart/form-data porque el usuario manda:
    - datos de texto;
    - imagen de perfil.

    IMPORTANTE:
    Usamos memoryStorage para evitar que la imagen se guarde automáticamente.

    Si una validación falla, la imagen nunca llega a uploads/users.
  */
  @Post('register')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      /*
        memoryStorage guarda el archivo temporalmente en memoria.

        Esto permite validar primero:
        - datos del DTO;
        - contraseñas iguales;
        - correo duplicado;
        - usuario duplicado.

        Recién después guardamos manualmente la imagen en disco.
      */
      storage: memoryStorage(),

      /*
        Límite de 3MB para la imagen de perfil.
      */
      limits: {
        fileSize: 3 * 1024 * 1024,
      },

      /*
        Validamos que el archivo recibido sea una imagen.
      */
      fileFilter: (_req, file, callback) => {
        const isImage = file.mimetype.startsWith('image/');

        if (!isImage) {
          return callback(
            new BadRequestException(
              'El archivo seleccionado debe ser una imagen.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file: UploadedImageFile | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    /*
      El PDF pide imagen de perfil.
      Si no llega archivo, respondemos 400.
    */
    if (!file) {
      throw new BadRequestException('La imagen de perfil es obligatoria.');
    }

    /*
      Base URL para construir la URL pública de la imagen.

      Ejemplo:
      http://localhost:3000
    */
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    /*
      AuthService se encarga de:
      - validar contraseñas;
      - validar duplicados;
      - hashear contraseña;
      - guardar imagen;
      - guardar usuario;
      - generar JWT.
    */
    const authResponse = await this.authService.register(
      registerDto,
      file,
      baseUrl,
    );

    /*
      Guardamos el JWT en cookie httpOnly.
    */
    this.setAccessTokenCookie(res, authResponse.accessToken);

    return {
      message: 'Usuario registrado correctamente.',
      user: authResponse.user,
    };
  }

  /*
    Login.

    Recibe JSON:
    {
      "usuarioOCorreo": "valen@test.com",
      "password": "Prueba123"
    }
  */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResponse = await this.authService.login(loginDto);

    this.setAccessTokenCookie(res, authResponse.accessToken);

    return {
      message: 'Inicio de sesión correcto.',
      user: authResponse.user,
    };
  }

  /*
    Logout.

    Borra la cookie access_token.
  */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return {
      message: 'Sesión cerrada correctamente.',
    };
  }

  /*
    Configuración centralizada de la cookie del JWT.
  */
  private setAccessTokenCookie(res: Response, accessToken: string): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 15 * 60 * 1000,
    });
  }
}