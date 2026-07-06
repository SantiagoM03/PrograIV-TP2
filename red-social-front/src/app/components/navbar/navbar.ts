import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /*
    Acá tengo la señal con el usuario actual.
    Si el usuario se registró o inició sesión, AuthService me lo deja acá.
  */
  currentUser = this.authService.currentUser;

  /*
    Acá tengo la señal booleana para saber si hay sesión.
  */
  isLoggedIn = this.authService.isLoggedIn;

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      error: () => {
        /*
          Si el logout falla por algún motivo, igual limpio la sesión local.
          Así evito que el usuario quede "trabado" visualmente.
        */
        this.authService.clearCurrentUser();
        this.router.navigateByUrl('/login');
      },
    });
  }
}