import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Post } from '../../models/post';
import { User } from '../../models/user';
import { PostCard } from '../../components/post-card/post-card';
import { AuthService } from '../../services/auth';
import { PostsService } from '../../services/posts';
import { ProfilesService } from '../../services/profiles';

@Component({
  selector: 'app-public-profile',
  imports: [RouterLink, PostCard],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.scss',
})
export class PublicProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly profilesService = inject(ProfilesService);
  private readonly postsService = inject(PostsService);

  currentUser = this.authService.currentUser;

  profileUser: User | null = null;
  latestPosts: Post[] = [];

  profileId = '';

  isLoading = true;
  pageError = '';

  processingPostId: string | null = null;

  showDeletePostModal = false;
  postToDelete: Post | null = null;
  deletePostError = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.profileId = params.get('id') ?? '';
      this.loadProfile();
    });
  }

  get isOwnProfile(): boolean {
    return this.currentUser()?.id === this.profileUser?.id;
  }

  get profileFullName(): string {
    if (!this.profileUser) {
      return '';
    }

    return `${this.profileUser.nombre} ${this.profileUser.apellido}`;
  }

  loadProfile(): void {
    this.pageError = '';
    this.profileUser = null;
    this.latestPosts = [];

    if (!this.profileId) {
      this.pageError = 'No se encontró el perfil solicitado.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.profilesService
      .getProfile(this.profileId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.profileUser = response.user;
          this.latestPosts = response.latestPosts;
        },
        error: (error: Error) => {
          this.pageError = error.message;
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
          this.pageError = error.message;
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
          this.pageError = error.message;
        },
      });
  }

  openDeletePostModal(post: Post): void {
    this.postToDelete = post;
    this.deletePostError = '';
    this.showDeletePostModal = true;
  }

  closeDeletePostModal(): void {
    if (this.processingPostId) {
      return;
    }

    this.showDeletePostModal = false;
    this.postToDelete = null;
    this.deletePostError = '';
  }

  confirmDeletePost(): void 
  {
    const post = this.postToDelete;

    if (!post) {
      return;
    }

    this.processingPostId = post.id;
    this.deletePostError = '';

    this.postsService
      .deletePost(post.id)
      .subscribe({
        next: () => {
          this.latestPosts = this.latestPosts.filter(
            (item) => item.id !== post.id,
          );

          /*
            Cierro el modal manualmente.
            No uso closeDeletePostModal() porque ese método bloquea el cierre
            mientras processingPostId tiene valor.
          */
          this.processingPostId = null;
          this.showDeletePostModal = false;
          this.postToDelete = null;
          this.deletePostError = '';
        },
        error: (error: Error) => {
          this.deletePostError =
            error.message || 'No se pudo dar de baja la publicación.';

          this.processingPostId = null;
        },
      });
  }

  private replacePost(updatedPost: Post): void {
    this.latestPosts = this.latestPosts.map((post) =>
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
}