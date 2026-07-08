/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../auth.service';
import { RequestWithAuthUser } from '../interfaces/request-with-auth-user.interface';
import { UsersService } from '../../users/users.service';

/*
  Acá valido autenticación por cookie.

  Leo la cookie:
  access_token

  Valido el JWT y guardo el usuario actual en:
  request.user
*/
@Injectable()
export class JwtCookieGuard implements CanActivate 
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> 
  {
    const request = context.switchToHttp().getRequest<RequestWithAuthUser>();
    const token = request.cookies?.['access_token'];

    if (!token) 
    {
      throw new UnauthorizedException('No hay sesión activa.');
    }

    try 
    {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      /*
        Acá busco el usuario real en MongoDB para confirmar que:
        - existe;
        - sigue habilitado.
      */
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado.');
      }

      if (!user.habilitado) {
        throw new ForbiddenException('Tu usuario se encuentra deshabilitado.');
      }

      /*
        Acá dejo disponible el usuario autenticado para los controllers.
      */
      request.user = 
      {
        id: String(user._id),
        correo: user.correo,
        nombreUsuario: user.nombreUsuario,
        perfil: user.perfil,
      };

      return true;

    } 
    catch (error) 
    {
      if 
      (
        error instanceof UnauthorizedException || error instanceof ForbiddenException
      ) 
      {
        throw error;
      }

      throw new UnauthorizedException('Sesión inválida o expirada.');
    }
  }
}