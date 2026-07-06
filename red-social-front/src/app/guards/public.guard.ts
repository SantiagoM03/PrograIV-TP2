import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

/*
  Acá defino el guard para rutas públicas.

  Lo uso en:
  - Login
  - Registro

  Si el usuario ya está logueado, no tiene sentido que vuelva
  a iniciar sesión o registrarse.
*/
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/publicaciones']);
  }

  return true;
};