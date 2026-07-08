import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

/*
  Guard para rutas exclusivas de administrador.

  Sprint 4:
  /dashboard/usuarios y /dashboard/estadisticas
  solo deben estar disponibles para usuarios con perfil administrador.
*/
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  if (currentUser.perfil !== 'administrador') {
    return router.createUrlTree(['/publicaciones']);
  }

  return true;
};