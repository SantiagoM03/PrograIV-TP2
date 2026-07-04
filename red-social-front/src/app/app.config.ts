import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    /*
      Habilita HttpClient en toda la app.

      Lo usamos para conectar Angular con NestJS:
      - POST /api/auth/register
      - POST /api/auth/login
      - POST /api/auth/logout
    */
    provideHttpClient(withFetch()),
  ],
};