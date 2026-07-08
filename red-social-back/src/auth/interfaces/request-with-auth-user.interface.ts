/* eslint-disable prettier/prettier */
import type { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.interface';

/*
  Acá extiendo la Request.

  Express por defecto no sabe que existe:
  - request.cookies
  - request.user

  Por eso creo esta interfaz para tipar correctamente
  las requests autenticadas.
*/
export interface RequestWithAuthUser extends Request 
{
  cookies: Record<string, string>;
  user?: AuthenticatedUser;
}