/* eslint-disable prettier/prettier */
import type { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.interface';

/*
  Request extendida.

  Express por defecto no sabe que existe:
  - request.cookies
  - request.user

  Entonces creamos esta interfaz para tipar correctamente
  las requests autenticadas.
*/
export interface RequestWithAuthUser extends Request 
{
  cookies: Record<string, string>;
  user?: AuthenticatedUser;
}