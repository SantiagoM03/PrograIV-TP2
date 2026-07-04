import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

/*
  Guard para rutas privadas.

  Se usa en pantallas que requieren usuario logueado,
  por ejemplo:
  - Mi perfil
  - Crear publicación
  - Dashboard admin más adelante

  Si no hay usuario logueado, redirige a /login.
*/
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};