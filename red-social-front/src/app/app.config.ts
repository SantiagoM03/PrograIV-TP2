import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { authErrorInterceptor } from './interceptors/auth-error.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    /*
      Acá habilito HttpClient en toda la app.

      Lo uso para conectar Angular con NestJS:
      - POST /api/auth/register
      - POST /api/auth/login
      - POST /api/auth/logout
    */
    provideHttpClient(
      withFetch(),
      withInterceptors([authErrorInterceptor]),
    ),
  ],
};