/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtCookieGuard } from './guards/jwt-cookie.guard';
import * as authenticatedUserInterface from './interfaces/authenticated-user.interface';

/*
  Acá defino el tipo mínimo para una imagen subida con Multer.

  Uso memoryStorage, por lo tanto el archivo NO se guarda automáticamente
  en uploads/users.

  Multer me entrega el archivo en memoria mediante "buffer".
  Después AuthService decide cuándo guardarlo de verdad.
*/
interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/*
  Acá manejo el controller de autenticación.

  Como en main.ts tenemos:
  app.setGlobalPrefix('api')

  Y acá:
  @Controller('auth')

  Entonces las rutas finales son:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
*/
@Controller('auth')
export class AuthController 
{
  constructor(private readonly authService: AuthService) {}


  /*
    Acá dejo un endpoint de prueba/compatibilidad.

    Lo mantengo como GET por si ya lo venías usando en Postman,
    pero para cumplir Sprint 3 uso POST /auth/autorizar.
  */
  @Get('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  autorizarGet(@CurrentUser() user: authenticatedUserInterface.AuthenticatedUser) 
  {
    return {
      message: 'Sesión válida.',
      user,
    };
  }

  /*
    Sprint 3:
    Acá autorizo sesión por POST.

    Valido si el token es válido y no está vencido.
    Si no es válido, JwtCookieGuard devuelve 401.
    Si es válido, devuelvo los datos completos del usuario.
  */
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async autorizarPost(@CurrentUser() user: authenticatedUserInterface.AuthenticatedUser) 
  {
    const authorizedUser = await this.authService.authorizeSession(user);

    return {
      message: 'Sesión válida.',
      user: authorizedUser,
    };
  }

  /*
    Sprint 3:
    Acá refresco sesión por POST.

    Valido el token actual.
    Si es válido, genero un JWT nuevo de 15 minutos
    y lo vuelvo a guardar en cookie httpOnly.
  */
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async refrescar(@CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,@Res({ passthrough: true }) res: Response) 
  {
    const authResponse = await this.authService.refreshSession(user);
    this.setAccessTokenCookie(res, authResponse.accessToken);

    return {
      message: 'Sesión refrescada correctamente.',
      user: authResponse.user,
    };
  }

  /*
    Acá registro un usuario.

    Recibe multipart/form-data porque el usuario manda:
    - datos de texto;
    - imagen de perfil.

    IMPORTANTE:
    Uso memoryStorage para evitar que la imagen se guarde automáticamente.

    Si una validación falla, la imagen nunca llega a uploads/users.
  */
  @Post('register')
  @UseInterceptors(FileInterceptor('imagenPerfil', 
  {
      /*
        Acá memoryStorage guarda el archivo temporalmente en memoria.

        Así puedo validar primero:
        - datos del DTO;
        - contraseñas iguales;
        - correo duplicado;
        - usuario duplicado.

        Recién después guardo manualmente la imagen en disco.
      */
      storage: memoryStorage(),

      /*
        Acá limito la imagen de perfil a 3MB.
      */
      limits: {fileSize: 3 * 1024 * 1024},

      /*
        Acá valido que el archivo recibido sea una imagen.
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

  async register(@Body() registerDto: RegisterDto, @UploadedFile() file: UploadedImageFile | undefined, @Req() req: Request, @Res({ passthrough: true }) res: Response) 
  {
    /*
      El PDF pide imagen de perfil.
      Si no llega archivo, respondo 400.
    */
    if (!file) 
    {
      throw new BadRequestException('La imagen de perfil es obligatoria.');
    }

    /*
      Acá armo la base URL para construir la URL pública de la imagen.

      Ejemplo:
      http://localhost:3000
    */
    const baseUrl = this.getBaseUrl(req);

    /*
      En AuthService me encargo de:
      - validar contraseñas;
      - validar duplicados;
      - hashear contraseña;
      - guardar imagen;
      - guardar usuario;
      - generar JWT.
    */
    const authResponse = await this.authService.register(registerDto, file, baseUrl);

    /*
      Acá guardo el JWT en cookie httpOnly.
    */
    this.setAccessTokenCookie(res, authResponse.accessToken);

    return {
      message: 'Usuario registrado correctamente.',
      user: authResponse.user,
    };
  }

  /*
    Acá hago login.

    Recibe JSON:
    {
      "usuarioOCorreo": "valen@test.com",
      "password": "Prueba123"
    }
  */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) 
  {
    const authResponse = await this.authService.login(loginDto);
    this.setAccessTokenCookie(res, authResponse.accessToken);

    return {
      message: 'Inicio de sesión correcto.',
      user: authResponse.user,
    };
  }

  /*
    Acá hago logout.

    Borro la cookie access_token.
  */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) 
  {
    res.clearCookie(
      'access_token',
      this.getClearAccessTokenCookieOptions(),
    );

    return {
      message: 'Sesión cerrada correctamente.',
    };
  }

  /*
    Guarda el JWT en una cookie llamada "access_token".

    Este método se usa después de:
    - register;
    - login;
    - refrescar sesión.

    El AuthService genera el JWT y lo devuelve como accessToken.
    Este controller toma ese token y lo manda al navegador dentro de una cookie.

    La cookie se llama:
    access_token

    Después, en cada request protegida, el navegador manda esa cookie
    automáticamente y JwtCookieGuard la lee desde:

    request.cookies['access_token']
  */
  private setAccessTokenCookie(res: Response, accessToken: string): void 
  {
    res.cookie(
      'access_token',
      accessToken,
      this.getAccessTokenCookieOptions(),
    );
  }

  /*
    Devuelve la configuración para CREAR la cookie del JWT.

    La configuración cambia según el entorno:

    LOCAL:
    - NODE_ENV no es production.
    - El frontend corre en http://localhost:4200.
    - El backend corre en http://localhost:3000.
    - Uso secure: false porque localhost trabaja con HTTP.
    - Uso sameSite: 'lax' porque alcanza para desarrollo local.

    PRODUCCIÓN:
    - NODE_ENV === 'production'.
    - El frontend va a estar en Vercel.
    - El backend va a estar en Render.
    - Son dominios distintos.
    - Para que el navegador acepte cookies entre dominios distintos,
      necesito:
      secure: true
      sameSite: 'none'

    Propiedades importantes:

    httpOnly:
    Hace que la cookie no pueda ser leída desde JavaScript del frontend.
    Esto es más seguro porque Angular no manipula directamente el JWT.

    secure:
    Si está en true, la cookie solo viaja por HTTPS.
    En producción debe ser true.

    sameSite:
    Controla si la cookie puede viajar entre sitios distintos.
    En producción uso 'none' porque Vercel y Render son dominios distintos.

    maxAge:
    Define cuánto dura la cookie.
    En este caso dura 15 minutos, igual que el vencimiento del JWT.
  */
  private getAccessTokenCookieOptions(): CookieOptions 
  {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    };
  }

  /*
    Devuelve la configuración para BORRAR la cookie del JWT.

    Se usa en logout.

    Es importante que las opciones usadas para borrar la cookie
    coincidan con las opciones principales con las que fue creada.

    Por eso también depende del entorno:

    LOCAL:
    secure: false
    sameSite: 'lax'

    PRODUCCIÓN:
    secure: true
    sameSite: 'none'

    No uso maxAge acá porque clearCookie se encarga de indicarle
    al navegador que elimine la cookie.
  */
  private getClearAccessTokenCookieOptions(): CookieOptions 
  {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    };
  }

  private getBaseUrl(req: Request): string 
  {
    const forwardedProto = req.headers['x-forwarded-proto'];

    const protocol = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto || req.protocol;

    return `${protocol}://${req.get('host')}`;
  }
}