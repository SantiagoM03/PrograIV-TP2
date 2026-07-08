import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { User } from '../models/user';

interface ListUsersBackendResponse {
  users: User[];
}

interface UserBackendResponse {
  message: string;
  user: User;
}

export interface CreateUserByAdminRequest {
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

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  listUsers(): Observable<User[]> {
    return this.http
      .get<ListUsersBackendResponse>(`${this.apiUrl}/users`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.users),
        catchError((error) => this.handleError(error)),
      );
  }

  createUser(data: CreateUserByAdminRequest): Observable<User> {
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
      .post<UserBackendResponse>(`${this.apiUrl}/users`, formData, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.user),
        catchError((error) => this.handleError(error)),
      );
  }

  disableUser(userId: string): Observable<User> {
    return this.http
      .delete<UserBackendResponse>(`${this.apiUrl}/users/${userId}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.user),
        catchError((error) => this.handleError(error)),
      );
  }

  enableUser(userId: string): Observable<User> {
    return this.http
      .post<UserBackendResponse>(
        `${this.apiUrl}/users/${userId}/habilitar`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.user),
        catchError((error) => this.handleError(error)),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error?.message ||
      'Ocurrió un error al procesar la operación de usuarios.';

    return throwError(() => new Error(message));
  }
}