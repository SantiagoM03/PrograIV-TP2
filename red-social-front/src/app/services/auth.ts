import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { User } from '../models/user';

export interface LoginRequest {
  usuarioOCorreo: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  repetirPassword: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  perfil: 'usuario' | 'administrador';
  imagenPerfil: File;
}

interface AuthBackendResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /*
    Acá defino la URL base del backend NestJS.
    Como en Nest tengo app.setGlobalPrefix('api'),
    todas las rutas empiezan con /api.
  */
  private readonly apiUrl = 'http://localhost:3000/api';

  /*
    Acá guardo el usuario actual en memoria y también en localStorage.

    El JWT real me queda en cookie httpOnly.
    El usuario en localStorage me sirve para mostrar datos en la UI.
  */
  private readonly currentUserSignal = signal<User | null>(
    this.getStoredUser(),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  readonly isAdmin = computed(
    () => this.currentUserSignal()?.perfil === 'administrador',
  );

  /*
    Sprint 3:
    Acá manejo el timer de sesión.

    El token vence a los 15 minutos.
    A los 10 minutos muestro un modal avisando que quedan 5.
  */
  private sessionWarningTimeoutId: number | null = null;
  private readonly showSessionModalSignal = signal(false);
  readonly showSessionModal = this.showSessionModalSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  /*
    Acá hago el registro real contra el backend.

    Mando FormData porque incluye imagen.
    No seteo Content-Type manualmente:
    el navegador lo arma solo como multipart/form-data.
  */
  register(data: RegisterRequest): Observable<User> 
  {
    const formData = new FormData();

    formData.append('nombre', data.nombre);
    formData.append('apellido', data.apellido);
    formData.append('correo', data.correo);
    formData.append('nombreUsuario', data.nombreUsuario);
    formData.append('password', data.password);
    formData.append('repetirPassword', data.repetirPassword);
    formData.append('fechaNacimiento', data.fechaNacimiento);
    formData.append('descripcionBreve', data.descripcionBreve);
    formData.append('perfil', data.perfil);
    formData.append('imagenPerfil', data.imagenPerfil);

    return this.http
      .post<AuthBackendResponse>(`${this.apiUrl}/auth/register`, formData, {
        /*
          Lo necesito para que el navegador acepte la cookie httpOnly
          que manda el backend.
        */
        withCredentials: true,
      })
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this.setCurrentUser(user);
            this.startSessionTimer();
          }),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /*
    Acá hago el login real contra el backend.

    El backend me acepta:
    - correo
    - o nombre de usuario

    Y me devuelve el usuario seguro, sin passwordHash.
  */
  login(data: LoginRequest): Observable<User> {
    return this.http
      .post<AuthBackendResponse>(`${this.apiUrl}/auth/login`, data, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this.setCurrentUser(user);
            this.startSessionTimer();
          }),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /*
    Acá hago el logout real contra el backend.

    El backend me borra la cookie access_token.
    Después limpio el usuario local.
  */
  logout(): Observable<void> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.stopSessionTimer();
          this.clearCurrentUser();
        }),
        map(() => undefined),
        catchError((error) => this.handleAuthError(error)),
      );
  }

    /*
    Sprint 3:
    Acá valido la sesión contra el backend.

    POST /api/auth/autorizar

    Si la cookie access_token es válida:
    - el backend devuelve el usuario;
    - actualizo currentUser;
    - dejo pasar a publicaciones.

    Si no es válida:
    - limpio usuario local;
    - el componente loading me redirige al login.
  */
  authorize(): Observable<User> {
    return this.http
      .post<AuthBackendResponse>(
        `${this.apiUrl}/auth/autorizar`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this.setCurrentUser(user);
          this.startSessionTimer();
        }),
        catchError((error) => {
          this.clearCurrentUser();
          return this.handleAuthError(error);
        }),
      );
  }

  /*
    Sprint 3:
    Acá refresco la sesión.

    POST /api/auth/refrescar

    Acá el backend me valida el token actual.
    Si está vigente, me genera otro token de 15 minutos
    y lo vuelve a guardar en cookie httpOnly.
  */
  refreshSession(): Observable<User> {
    return this.http
      .post<AuthBackendResponse>(
        `${this.apiUrl}/auth/refrescar`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this.setCurrentUser(user);
            this.startSessionTimer();
          }),
        catchError((error) => {
          this.clearCurrentUser();
          return this.handleAuthError(error);
        }),
      );
  }

  /*
    Acá guardo el usuario en memoria y localStorage.
  */
  private setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    localStorage.setItem('red-social-user', JSON.stringify(user));
  }

  /*
    Acá limpio el usuario local.
  */
  clearCurrentUser(): void {
    this.stopSessionTimer();
    this.currentUserSignal.set(null);
    localStorage.removeItem('red-social-user');
  }

  /*
    Acá recupero el usuario guardado al refrescar la pantalla.
  */
  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('red-social-user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('red-social-user');
      return null;
    }
  }

    /*
    Acá inicio el contador de sesión.

    En producción uso 10 minutos:
    10 * 60 * 1000

    Para probar rápido, puedo cambiar temporalmente a:
    10 * 1000
  */
  startSessionTimer(): void 
  {
    this.stopSessionTimer();
    const tenMinutes = 10 * 60 * 1000;

    this.sessionWarningTimeoutId = window.setTimeout(() => 
    {
      this.showSessionModalSignal.set(true);
    }, tenMinutes);
  }

  /*
    Acá detengo el contador y oculto el modal.
  */
  stopSessionTimer(): void 
  {
    if (this.sessionWarningTimeoutId !== null) 
    {
      window.clearTimeout(this.sessionWarningTimeoutId);
      this.sessionWarningTimeoutId = null;
    }

    this.showSessionModalSignal.set(false);
  }

  /*
    Acá oculto el modal sin cerrar sesión.
  */
  hideSessionModal(): void 
  {
    this.showSessionModalSignal.set(false);
  }

  /*
    Acá normalizo errores del backend para mostrarlos fácil en la UI.

    NestJS me puede devolver:
    {
      message: "Credenciales inválidas."
    }

    o también:
    {
      message: ["El correo debe tener un formato válido.", "..."]
    }
  */
  private handleAuthError(error: HttpErrorResponse) {
    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return throwError(() => new Error(backendMessage.join(' ')));
    }

    if (typeof backendMessage === 'string') {
      return throwError(() => new Error(backendMessage));
    }

    return throwError(
      () => new Error('Ocurrió un error. Intentá nuevamente.'),
    );
  }
}