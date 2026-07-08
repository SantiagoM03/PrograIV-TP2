/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserProfile } from '../../users/schemas/user.schema';
import { RequestWithAuthUser } from '../interfaces/request-with-auth-user.interface';

/*
  Guard de administrador.

  Se usa después de JwtCookieGuard.
  JwtCookieGuard valida el token y carga request.user.
  AdminGuard valida que request.user.perfil sea "administrador".
*/
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuthUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('No hay usuario autenticado.');
    }

    if (user.perfil !== UserProfile.Administrador) {
      throw new ForbiddenException(
        'Solo un administrador puede realizar esta acción.',
      );
    }

    return true;
  }
}