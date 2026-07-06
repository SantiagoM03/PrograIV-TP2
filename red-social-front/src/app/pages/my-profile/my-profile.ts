import { Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';

import { PostCard } from '../../components/post-card/post-card';
import { Post } from '../../models/post';
import { AuthService } from '../../services/auth';
import { PostsService } from '../../services/posts';

@Component({
  selector: 'app-my-profile',
  imports: [PostCard],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);

  /*
    Usuario real logueado.
  */
  currentUser = this.authService.currentUser;

  /*
    Últimas 3 publicaciones reales del usuario.
  */
  myLastPosts: Post[] = [];

  isLoadingPosts = false;
  postsError = '';
  processingPostId: string | null = null;

  ngOnInit(): void {
    this.loadMyLastPosts();
  }

  loadMyLastPosts(): void {
    const user = this.currentUser();

    if (!user) {
      return;
    }

    this.postsError = '';
    this.isLoadingPosts = true;

    /*
      Sprint 2 pide últimas 3 publicaciones del usuario.
      Usamos el GET del backend con:
      - userId
      - orderBy=fecha
      - offset=0
      - limit=3
    */
    this.postsService
      .listPosts({
        userId: user.id,
        orderBy: 'fecha',
        offset: 0,
        limit: 3,
      })
      .pipe(
        finalize(() => {
          this.isLoadingPosts = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.myLastPosts = response.items;
        },
        error: (error: Error) => {
          this.postsError = error.message;
        },
      });
  }

  likePost(post: Post): void {
    this.processingPostId = post.id;

    this.postsService
      .likePost(post.id)
      .pipe(
        finalize(() => {
          this.processingPostId = null;
        }),
      )
      .subscribe({
        next: (updatedPost) => {
          this.replacePost(updatedPost);
        },
        error: (error: Error) => {
          this.postsError = error.message;
        },
      });
  }

  unlikePost(post: Post): void {
    this.processingPostId = post.id;

    this.postsService
      .unlikePost(post.id)
      .pipe(
        finalize(() => {
          this.processingPostId = null;
        }),
      )
      .subscribe({
        next: (updatedPost) => {
          this.replacePost(updatedPost);
        },
        error: (error: Error) => {
          this.postsError = error.message;
        },
      });
  }

  deletePost(post: Post): void {
    this.processingPostId = post.id;

    this.postsService
      .deletePost(post.id)
      .pipe(
        finalize(() => {
          this.processingPostId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.myLastPosts = this.myLastPosts.filter(
            (item) => item.id !== post.id,
          );
        },
        error: (error: Error) => {
          this.postsError = error.message;
        },
      });
  }

  private replacePost(updatedPost: Post): void {
    this.myLastPosts = this.myLastPosts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );
  }

  formatDate(dateValue: string): string {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatPerfil(perfil: string): string {
    return perfil === 'administrador' ? 'Administrador' : 'Usuario';
  }

  getFullName(nombre: string, apellido: string): string {
    return `${nombre} ${apellido}`;
  }
}