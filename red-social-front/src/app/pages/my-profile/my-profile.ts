import { Component, inject } from '@angular/core';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-my-profile',
  imports: [],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile {
  private readonly authService = inject(AuthService);

  /*
    Usuario real logueado.

    AuthService lo guarda cuando:
    - el usuario se registra;
    - el usuario inicia sesión.
  */
  currentUser = this.authService.currentUser;

  formatDate(dateValue: string): string {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatPerfil(perfil: string): string {
    return perfil === 'administrador' ? 'Administrador' : 'Usuario';
  }

  getFullName(nombre: string, apellido: string): string {
    return `${nombre} ${apellido}`;
  }
}