export type UserProfile = 'usuario' | 'administrador';
export interface User 
{
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  imagenPerfil: string;
  perfil: UserProfile;
}