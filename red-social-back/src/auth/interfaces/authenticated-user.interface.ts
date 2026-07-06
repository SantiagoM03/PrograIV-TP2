/* eslint-disable prettier/prettier */
import { UserProfile } from '../../users/schemas/user.schema';

/*
  Usuario autenticado obtenido desde el JWT.

  Este objeto se guarda en request.user
  después de pasar por JwtCookieGuard.
*/
export interface AuthenticatedUser 
{
  id: string;
  correo: string;
  nombreUsuario: string;
  perfil: UserProfile;
}