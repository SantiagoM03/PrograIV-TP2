/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtCookieGuard } from './guards/jwt-cookie.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AdminGuard } from '../auth/guards/admin.guard';

/*
  Tipo que representa el valor permitido por JWT para expiresIn.

  Ejemplos válidos:
  - '15m'
  - '1h'
  - '7d'
  - 900

  Lo usamos porque TypeScript necesita saber que el string del .env
  representa un valor válido para la configuración del JWT.
*/
type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

@Module({
  imports: [
    /*
      AuthModule necesita UsersModule porque la autenticación
      depende de usuarios.

      AuthService va a usar UsersService para:
      - registrar usuarios;
      - buscar usuario por correo o nombre de usuario;
      - validar duplicados;
      - validar login.
    */
    forwardRef(() => UsersModule),

    /*
      JwtModule permite generar y validar tokens JWT.

      Lo configuramos con registerAsync porque los valores vienen del .env:
      - JWT_SECRET
      - JWT_EXPIRES_IN

      Esto evita dejar claves secretas escritas directamente en el código.
    */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      /*
        Indicamos explícitamente que esta función devuelve JwtModuleOptions.

        Eso ayuda a TypeScript a validar correctamente la configuración
        que estamos retornando.
      */
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        /*
          JWT_SECRET es la clave privada con la que firmamos los tokens.

          Si no existe en .env, getOrThrow corta la ejecución del backend.
          Esto es bueno porque no queremos que la app funcione sin secreto JWT.
        */
        const secret = configService.getOrThrow<string>('JWT_SECRET');

        /*
          JWT_EXPIRES_IN define cuánto dura el token.

          El PDF pide que el token venza a los 15 minutos.
          Por eso, si no encuentra la variable en .env, usamos '15m'.

          Hacemos el casteo a JwtExpiresIn porque @nestjs/jwt espera
          un tipo más específico que un string común.
        */
        const expiresIn = (
          configService.get<string>('JWT_EXPIRES_IN') ?? '15m'
        ) as JwtExpiresIn;

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],

  /*
    AuthController va a exponer rutas como:
    - POST /api/auth/register
    - POST /api/auth/login
    - POST /api/auth/logout
    - POST /api/auth/autorizar
    - POST /api/auth/refrescar
  */
  controllers: [AuthController],

  /*
    AuthService va a contener la lógica de autenticación:
    - validar datos;
    - hashear contraseña;
    - comparar contraseña con bcrypt;
    - generar JWT;
    - preparar cookie;
    - devolver usuario seguro.
  */
  providers: [AuthService, JwtCookieGuard, AdminGuard],
  exports: [AuthService, JwtModule, JwtCookieGuard, AdminGuard],
})
export class AuthModule {}