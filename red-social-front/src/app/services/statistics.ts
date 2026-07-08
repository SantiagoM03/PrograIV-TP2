import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export interface PostsByUserStat {
  userId: string;
  nombreUsuario: string;
  nombreCompleto: string;
  totalPublicaciones: number;
}

export interface CommentsByDayStat {
  date: string;
  totalComentarios: number;
}

export interface CommentsByPostStat {
  postId: string;
  title: string;
  authorNombreUsuario: string;
  totalComentarios: number;
}

export interface StatisticsDateRange {
  from: string;
  to: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  getPostsByUser(range: StatisticsDateRange): Observable<PostsByUserStat[]> {
    return this.http
      .get<PostsByUserStat[]>(`${this.apiUrl}/statistics/posts-by-user`, {
        params: this.buildDateParams(range),
        withCredentials: true,
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  getCommentsByDay(range: StatisticsDateRange): Observable<CommentsByDayStat[]> {
    return this.http
      .get<CommentsByDayStat[]>(`${this.apiUrl}/statistics/comments-by-day`, {
        params: this.buildDateParams(range),
        withCredentials: true,
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  getCommentsByPost(
    range: StatisticsDateRange,
  ): Observable<CommentsByPostStat[]> {
    return this.http
      .get<CommentsByPostStat[]>(
        `${this.apiUrl}/statistics/comments-by-post`,
        {
          params: this.buildDateParams(range),
          withCredentials: true,
        },
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  private buildDateParams(range: StatisticsDateRange): HttpParams {
    let params = new HttpParams();

    if (range.from) {
      params = params.set('from', range.from);
    }

    if (range.to) {
      params = params.set('to', range.to);
    }

    return params;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error?.message ||
      'Ocurrió un error al obtener las estadísticas.';

    return throwError(() => new Error(message));
  }
}