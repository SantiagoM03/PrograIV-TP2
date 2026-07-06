export type UserProfile = 'usuario' | 'administrador';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;

  /*
    El backend me devuelve imagenPerfilUrl.
    Esta URL apunta a:
    http://localhost:3000/uploads/users/...
  */
  imagenPerfilUrl: string;

  perfil: UserProfile;
  habilitado: boolean;
}