/* eslint-disable prettier/prettier */
import { UserProfile } from '../../users/schemas/user.schema';

/*
  Acá tipé el usuario autenticado que obtengo desde el JWT.

  Este objeto lo guardo en request.user
  después de pasar por JwtCookieGuard.
*/
export interface AuthenticatedUser 
{
  id: string;
  correo: string;
  nombreUsuario: string;
  perfil: UserProfile;
}