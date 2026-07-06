import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

/*
  Sprint 3:
  Si cualquier petición protegida devuelve 401,
  limpio la sesión local y redirijo al login.

  Excluyo login/register porque ahí quiero mostrar el error en pantalla
  y no hacer una redirección innecesaria.
*/
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => 
{
  const router = inject(Router);
  const authService = inject(AuthService);

  const isAuthLoginOrRegister =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthLoginOrRegister) {
        authService.clearCurrentUser();
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};