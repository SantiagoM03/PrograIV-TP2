import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { PostCard } from '../../components/post-card/post-card';
import { Post } from '../../models/post';
import { AuthService } from '../../services/auth';
import { PostsService } from '../../services/posts';

@Component({
  selector: 'app-posts',
  imports: [ReactiveFormsModule, PostCard],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class Posts implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  posts: Post[] = [];

  orderBy: 'fecha' | 'likes' = 'fecha';

  offset = 0;
  limit = 5;
  total = 0;

  isLoading = false;
  isCreating = false;

  feedError = '';
  createError = '';

  selectedPostImageFile: File | null = null;
  selectedPostImageName = '';
  postImagePreview = '';

  processingPostId: string | null = null;

  createPostForm = this.fb.group({
    title: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
      ],
    ],
  });

  ngOnInit(): void {
    this.loadPosts();
  }

  get title() {
    return this.createPostForm.get('title');
  }

  get description() {
    return this.createPostForm.get('description');
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.total / this.limit), 1);
  }

  get canGoPrevious(): boolean {
    return this.offset > 0;
  }

  get canGoNext(): boolean {
    return this.offset + this.limit < this.total;
  }

  loadPosts(): void {
    this.feedError = '';
    this.isLoading = true;

    this.postsService
      .listPosts({
        orderBy: this.orderBy,
        offset: this.offset,
        limit: this.limit,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.posts = response.items;
          this.total = response.total;
          this.offset = response.offset;
          this.limit = response.limit;
          this.orderBy = response.orderBy;
        },
        error: (error: Error) => {
          this.feedError = error.message;
        },
      });
  }

  changeOrder(orderBy: 'fecha' | 'likes'): void {
    if (this.orderBy === orderBy) {
      return;
    }

    this.orderBy = orderBy;
    this.offset = 0;
    this.loadPosts();
  }

  goPreviousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.offset = Math.max(this.offset - this.limit, 0);
    this.loadPosts();
  }

  goNextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.offset = this.offset + this.limit;
    this.loadPosts();
  }

  onPostImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.createError = '';

    if (!file) {
      this.clearSelectedPostImage();
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.clearSelectedPostImage();
      this.createError = 'El archivo seleccionado debe ser una imagen.';
      return;
    }

    const maxSizeInMb = 4;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      this.clearSelectedPostImage();
      this.createError = `La imagen no puede superar los ${maxSizeInMb}MB.`;
      return;
    }

    this.selectedPostImageFile = file;
    this.selectedPostImageName = file.name;

    const reader = new FileReader();

    reader.onload = () => {
      this.postImagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  createPost(): void 
  {
    this.createError = '';

    if (this.createPostForm.invalid) {
      this.createPostForm.markAllAsTouched();
      return;
    }

    const formValue = this.createPostForm.getRawValue();

    this.isCreating = true;

    this.postsService
      .createPost({
        title: formValue.title!.trim(),
        description: formValue.description!.trim(),
        imagen: this.selectedPostImageFile,
      })
      .pipe(
        finalize(() => {
          this.isCreating = false;
        }),
      )
      .subscribe({
        next: (createdPost) => {
          this.createPostForm.reset();
          this.clearSelectedPostImage();

          /*
            La consigna pide que por defecto el listado esté ordenado por fecha.
            Como la publicación recién creada es la más nueva, la agrego arriba
            sin volver a disparar un GET que puede dejar el loader colgado.
          */
          this.orderBy = 'fecha';
          this.offset = 0;

          this.posts = [createdPost, ...this.posts].slice(0, this.limit);
          this.total = this.total + 1;

          this.feedError = '';
        },
        error: (error: Error) => {
          this.createError = error.message;
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
          this.feedError = error.message;
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
          this.feedError = error.message;
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
          /*
            Como el backend hace baja lógica, en el feed simplemente
            quito la publicación de la lista visible.
          */
          this.posts = this.posts.filter((item) => item.id !== post.id);
          this.total = Math.max(this.total - 1, 0);

          if (this.posts.length === 0 && this.offset > 0) {
            this.offset = Math.max(this.offset - this.limit, 0);
            this.loadPosts();
          }
        },
        error: (error: Error) => {
          this.feedError = error.message;
        },
      });
  }

  private replacePost(updatedPost: Post): void {
    this.posts = this.posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );
  }

  private clearSelectedPostImage(): void {
    this.selectedPostImageFile = null;
    this.selectedPostImageName = '';
    this.postImagePreview = '';
  }
}