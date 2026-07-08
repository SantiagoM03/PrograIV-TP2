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

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/auth/login');
      const isRegisterRequest = req.url.includes('/auth/register');
      const isAuthorizeRequest = req.url.includes('/auth/autorizar');
      const isRefreshRequest = req.url.includes('/auth/refrescar');
      const isLogoutRequest = req.url.includes('/auth/logout');

      const isAuthRequest =
        isLoginRequest ||
        isRegisterRequest ||
        isAuthorizeRequest ||
        isRefreshRequest ||
        isLogoutRequest;

      /*
        Si falla login/register/autorizar/refrescar/logout,
        NO redirijo desde el interceptor.

        Dejo que cada componente o service maneje su error.
        Esto es clave para que Login pueda mostrar:
        "Credenciales inválidas."
      */
      if (isAuthRequest) {
        return throwError(() => error);
      }

      /*
        Si una request protegida falla con 401, ahí sí limpio sesión
        y mando al login.
      */
      if (error.status === 401) {
        authService.clearCurrentUser();
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};