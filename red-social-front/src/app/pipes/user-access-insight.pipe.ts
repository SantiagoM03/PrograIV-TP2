import { Pipe, PipeTransform } from '@angular/core';

import { User } from '../models/user';

/*
  Pipe propia Sprint 4.

  Traduce el estado técnico del usuario
  a una lectura clara para el administrador.
*/
@Pipe({
  name: 'userAccessInsight',
  standalone: true,
})
export class UserAccessInsightPipe implements PipeTransform {
  transform(user: User | null | undefined): string {
    if (!user) {
      return 'Sin usuario';
    }

    if (user.perfil === 'administrador' && user.habilitado) {
      return '🛡 Administrador activo';
    }

    if (user.perfil === 'administrador' && !user.habilitado) {
      return '🚫 Administrador deshabilitado';
    }

    if (user.perfil === 'usuario' && user.habilitado) {
      return '👤 Usuario activo';
    }

    if (user.perfil === 'usuario' && !user.habilitado) {
      return '🔒 Usuario deshabilitado';
    }

    return 'Sin estado';
  }
}