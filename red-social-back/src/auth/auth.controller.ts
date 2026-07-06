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
  Get,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtCookieGuard } from './guards/jwt-cookie.guard';
import * as authenticatedUserInterface from './interfaces/authenticated-user.interface';

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
export class AuthController 
{
  constructor(private readonly authService: AuthService) {}


  /*
    Endpoint de prueba/compatibilidad.

    Lo dejamos como GET por si ya lo estabas usando en Postman,
    pero para cumplir Sprint 3 vamos a usar POST /auth/autorizar.
  */
  @Get('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  autorizarGet(@CurrentUser() user: authenticatedUserInterface.AuthenticatedUser) {
    return {
      message: 'Sesión válida.',
      user,
    };
  }

  /*
    Sprint 3:
    Ruta autorizar por POST.

    Valida si el token es válido y no está vencido.
    Si no es válido, JwtCookieGuard devuelve 401.
    Si es válido, devolvemos los datos completos del usuario.
  */
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async autorizarPost(@CurrentUser() user: authenticatedUserInterface.AuthenticatedUser) {
    const authorizedUser = await this.authService.authorizeSession(user);

    return {
      message: 'Sesión válida.',
      user: authorizedUser,
    };
  }

  /*
    Sprint 3:
    Ruta refrescar por POST.

    Valida el token actual.
    Si es válido, genera un nuevo JWT de 15 minutos
    y vuelve a guardarlo en cookie httpOnly.
  */
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async refrescar(
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResponse = await this.authService.refreshSession(user);

    this.setAccessTokenCookie(res, authResponse.accessToken);

    return {
      message: 'Sesión refrescada correctamente.',
      user: authResponse.user,
    };
  }
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