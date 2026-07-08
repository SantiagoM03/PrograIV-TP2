import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { Post } from '../models/post';
import { User } from '../models/user';

export interface PublicProfileResponse {
  user: User;
  latestPosts: Post[];
}

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  getProfile(userId: string): Observable<PublicProfileResponse> {
    return this.http
      .get<PublicProfileResponse>(`${this.apiUrl}/profiles/${userId}`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => this.handleError(error)),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error?.message ||
      'No se pudo cargar el perfil solicitado.';

    return throwError(() => new Error(message));
  }
}