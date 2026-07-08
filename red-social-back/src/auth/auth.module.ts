/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtCookieGuard } from './guards/jwt-cookie.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AnalyticsModule } from '../analytics/analytics.module';

/*
  Acá tipé el valor permitido por JWT para expiresIn.

  Ejemplos válidos:
  - '15m'
  - '1h'
  - '7d'
  - 900

  Lo uso para que TypeScript sepa que el string del .env
  representa un valor válido para la configuración del JWT.
*/
type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

@Module({
  imports: [
    AnalyticsModule,
    /*
      Acá importo UsersModule porque la autenticación
      depende de usuarios.

      En AuthService uso UsersService para:
      - registrar usuarios;
      - buscar usuario por correo o nombre de usuario;
      - validar duplicados;
      - validar login.
    */
    forwardRef(() => UsersModule),

    /*
      JwtModule me permite generar y validar tokens JWT.

      Lo configuro con registerAsync porque los valores vienen del .env:
      - JWT_SECRET
      - JWT_EXPIRES_IN

      Así evito dejar claves secretas escritas directamente en el código.
    */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      /*
        Acá indico explícitamente que esta función devuelve JwtModuleOptions.

        Eso me ayuda a validar correctamente la configuración
        que estoy retornando.
      */
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        /*
          JWT_SECRET es la clave privada con la que firmo los tokens.

          Si no existe en .env, getOrThrow corta la ejecución del backend.
          Eso me evita que la app funcione sin secreto JWT.
        */
        const secret = configService.getOrThrow<string>('JWT_SECRET');

        /*
          JWT_EXPIRES_IN define cuánto dura el token.

          El PDF pide que el token venza a los 15 minutos.
          Por eso, si no encuentro la variable en .env, uso '15m'.

          Hago el casteo a JwtExpiresIn porque @nestjs/jwt espera
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
    Acá expongo rutas como:
    - POST /api/auth/register
    - POST /api/auth/login
    - POST /api/auth/logout
    - POST /api/auth/autorizar
    - POST /api/auth/refrescar
  */
  controllers: [AuthController],

  /*
    En AuthService concentro la lógica de autenticación:
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