/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { RequestWithAuthUser } from '../interfaces/request-with-auth-user.interface';

/*
  Decorador para obtener el usuario autenticado dentro de un controller.

  Ejemplo:
  @CurrentUser() user: AuthenticatedUser

  También permite obtener una propiedad puntual:
  @CurrentUser('id') userId: string
*/
export const CurrentUser = createParamDecorator(
(
    data: keyof AuthenticatedUser | undefined,
    context: ExecutionContext,) => 
    {
        const request = context.switchToHttp().getRequest<RequestWithAuthUser>();
        const user = request.user;

        if (!data) {
        return user;
        }

        return user?.[data];
    },
);