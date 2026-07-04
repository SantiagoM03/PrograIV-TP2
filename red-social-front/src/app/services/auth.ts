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
    URL base del backend NestJS.
    Como en Nest tenemos app.setGlobalPrefix('api'),
    todas las rutas empiezan con /api.
  */
  private readonly apiUrl = 'http://localhost:3000/api';

  /*
    Guardamos el usuario actual en memoria y también en localStorage.

    El JWT real queda en cookie httpOnly.
    El usuario en localStorage nos sirve para mostrar datos en la UI.
  */
  private readonly currentUserSignal = signal<User | null>(
    this.getStoredUser(),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  readonly isAdmin = computed(
    () => this.currentUserSignal()?.perfil === 'administrador',
  );

  constructor(private readonly http: HttpClient) {}

  /*
    Registro real contra el backend.

    Se manda FormData porque incluye imagen.
    No seteamos Content-Type manualmente:
    el navegador lo arma solo como multipart/form-data.
  */
  register(data: RegisterRequest): Observable<User> {
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
          Necesario para que el navegador acepte la cookie httpOnly
          que manda el backend.
        */
        withCredentials: true,
      })
      .pipe(
        map((response) => response.user),
        tap((user) => this.setCurrentUser(user)),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /*
    Login real contra el backend.

    El backend acepta:
    - correo
    - o nombre de usuario

    Y devuelve el usuario seguro, sin passwordHash.
  */
  login(data: LoginRequest): Observable<User> {
    return this.http
      .post<AuthBackendResponse>(`${this.apiUrl}/auth/login`, data, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.user),
        tap((user) => this.setCurrentUser(user)),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /*
    Logout real contra el backend.

    El backend borra la cookie access_token.
    Después limpiamos el usuario local.
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
        tap(() => this.clearCurrentUser()),
        map(() => undefined),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /*
    Guarda el usuario en memoria y localStorage.
  */
  private setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    localStorage.setItem('red-social-user', JSON.stringify(user));
  }

  /*
    Limpia usuario local.
  */
  clearCurrentUser(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('red-social-user');
  }

  /*
    Recupera usuario guardado al refrescar la pantalla.
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
    Normalizamos errores del backend para mostrarlos fácil en la UI.

    NestJS puede devolver:
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