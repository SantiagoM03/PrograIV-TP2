import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import {
  CreateCommentRequest,
  CreatePostRequest,
  ListCommentsResponse,
  ListPostsResponse,
  Post,
  PostComment,
  PostDetailResponse,
  UpdateCommentRequest,
} from '../models/post';

interface PostBackendResponse 
{
  message: string;
  post: Post;
}

interface CommentBackendResponse {
  message: string;
  comment: PostComment;
}

export interface ListPostsParams 
{
  orderBy?: 'fecha' | 'likes';
  userId?: string;
  offset?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PostsService 
{
  private readonly apiUrl = 'http://localhost:3000/api/posts';

  constructor(private readonly http: HttpClient) {}

  listPosts(params: ListPostsParams): Observable<ListPostsResponse> {
    let httpParams = new HttpParams();

    if (params.orderBy) {
      httpParams = httpParams.set('orderBy', params.orderBy);
    }

    if (params.userId) {
      httpParams = httpParams.set('userId', params.userId);
    }

    if (params.offset !== undefined) {
      httpParams = httpParams.set('offset', params.offset);
    }

    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit);
    }

    return this.http
      .get<ListPostsResponse>(this.apiUrl, {
        params: httpParams,
        withCredentials: true,
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  getPostById(postId: string): Observable<Post> 
  {
    return this.http
      .get<PostDetailResponse>(`${this.apiUrl}/${postId}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.post),
        catchError((error) => this.handleError(error)),
      );
  }

  listComments(
    postId: string,
    offset: number,
    limit: number,
  ): Observable<ListCommentsResponse> {
    return this.http
      .get<ListCommentsResponse>(`${this.apiUrl}/${postId}/comments`, {
        params: new HttpParams()
          .set('offset', offset)
          .set('limit', limit),
        withCredentials: true,
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  addComment(
    postId: string,
    data: CreateCommentRequest,
  ): Observable<PostComment> {
    return this.http
      .post<CommentBackendResponse>(
        `${this.apiUrl}/${postId}/comments`,
        data,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.comment),
        catchError((error) => this.handleError(error)),
      );
  }

  updateComment(
    postId: string,
    commentId: string,
    data: UpdateCommentRequest,
  ): Observable<PostComment> {
    return this.http
      .put<CommentBackendResponse>(
        `${this.apiUrl}/${postId}/comments/${commentId}`,
        data,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.comment),
        catchError((error) => this.handleError(error)),
      );
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);

    if (data.imagen) {
      formData.append('imagen', data.imagen);
    }

    return this.http
      .post<PostBackendResponse>(this.apiUrl, formData, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.post),
        catchError((error) => this.handleError(error)),
      );
  }

  deletePost(postId: string): Observable<Post> {
    return this.http
      .delete<PostBackendResponse>(`${this.apiUrl}/${postId}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.post),
        catchError((error) => this.handleError(error)),
      );
  }

  likePost(postId: string): Observable<Post> {
    return this.http
      .post<PostBackendResponse>(
        `${this.apiUrl}/${postId}/likes`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.post),
        catchError((error) => this.handleError(error)),
      );
  }

  unlikePost(postId: string): Observable<Post> {
    return this.http
      .delete<PostBackendResponse>(`${this.apiUrl}/${postId}/likes`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.post),
        catchError((error) => this.handleError(error)),
      );
  }

  private handleError(error: HttpErrorResponse) {
    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return throwError(() => new Error(backendMessage.join(' ')));
    }

    if (typeof backendMessage === 'string') {
      return throwError(() => new Error(backendMessage));
    }

    return throwError(
      () => new Error('Ocurrió un error con las publicaciones.'),
    );
  }
}