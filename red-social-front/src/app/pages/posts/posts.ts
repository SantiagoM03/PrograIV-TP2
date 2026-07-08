import { Component, HostListener, OnInit, inject } from '@angular/core';
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

  /*
    Sprint 5:
    Reemplazamos paginación tradicional por scroll infinito.

    isLoadingInitial:
    - carga inicial del feed.

    isLoadingMore:
    - carga automática cuando el usuario llega cerca del final.
  */
  isLoadingInitial = false;
  isLoadingMore = false;

  isCreating = false;

  feedError = '';
  createError = '';

  selectedPostImageFile: File | null = null;
  selectedPostImageName = '';
  postImagePreview = '';

  processingPostId: string | null = null;
  private activeFeedRequestId = 0;

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
    this.resetFeed();
  }

  /*
    Escucha el scroll de la ventana.

    Cuando el usuario está cerca del final de la página,
    intenta cargar más publicaciones automáticamente.
  */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    const distanceFromBottom = pageHeight - scrollPosition;

    if (distanceFromBottom <= 420) {
      this.loadMorePosts();
    }
  }

  get title() {
    return this.createPostForm.get('title');
  }

  get description() {
    return this.createPostForm.get('description');
  }

  get hasMorePosts(): boolean {
    return this.posts.length < this.total;
  }

  get isFeedLoading(): boolean {
    return this.isLoadingInitial || this.isLoadingMore;
  }

  /*
    Reinicia el feed completo.

    Se usa:
    - al entrar por primera vez;
    - al cambiar el ordenamiento.
  */
  resetFeed(): void {
    this.activeFeedRequestId++;

    this.posts = [];
    this.offset = 0;
    this.total = 0;
    this.feedError = '';

    this.loadInitialPosts(this.activeFeedRequestId);
  }

  loadInitialPosts(requestId = this.activeFeedRequestId): void {
    this.feedError = '';
    this.isLoadingInitial = true;

    const requestedOrder = this.orderBy;

    this.postsService
      .listPosts({
        orderBy: requestedOrder,
        offset: 0,
        limit: this.limit,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.activeFeedRequestId) {
            this.isLoadingInitial = false;
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.activeFeedRequestId) {
            return;
          }

          this.posts = response.items;
          this.total = response.total;
          this.offset = response.items.length;
          this.limit = response.limit;

          /*
            Mantengo el orden pedido desde el botón.
            No dejo que una respuesta vieja pise el estado visual.
          */
          this.orderBy = requestedOrder;
        },
        error: (error: Error) => {
          if (requestId !== this.activeFeedRequestId) {
            return;
          }

          this.feedError = error.message;
        },
      });
  }

  loadMorePosts(): void {
    if (
      this.isLoadingInitial ||
      this.isLoadingMore ||
      !this.hasMorePosts
    ) {
      return;
    }

    this.feedError = '';
    this.isLoadingMore = true;

    const requestId = this.activeFeedRequestId;
    const requestedOrder = this.orderBy;

    this.postsService
      .listPosts({
        orderBy: requestedOrder,
        offset: this.offset,
        limit: this.limit,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.activeFeedRequestId) {
            this.isLoadingMore = false;
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.activeFeedRequestId) {
            return;
          }

          const newItems = response.items.filter(
            (newPost) => !this.posts.some((post) => post.id === newPost.id),
          );

          this.posts = [...this.posts, ...newItems];

          this.total = response.total;
          this.limit = response.limit;
          this.offset = this.posts.length;
          this.orderBy = requestedOrder;
        },
        error: (error: Error) => {
          if (requestId !== this.activeFeedRequestId) {
            return;
          }

          this.feedError = error.message;
        },
      });
  }

  changeOrder(orderBy: 'fecha' | 'likes'): void 
  {
    this.orderBy = orderBy;
    this.resetFeed();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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

  createPost(): void {
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
            La publicación nueva se muestra automáticamente arriba.
            Como es la más reciente, dejamos el orden por fecha.
          */
          this.orderBy = 'fecha';
          this.feedError = '';

          /*
            Después de crear una publicación, reinicio el feed por fecha.
            Así no queda mezclado un feed que estaba ordenado por likes.
          */
          this.resetFeed();

          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
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
            Baja lógica:
            quitamos la publicación del feed visible.
          */
          this.posts = this.posts.filter((item) => item.id !== post.id);
          this.total = Math.max(this.total - 1, 0);
          this.offset = this.posts.length;

          /*
            Si todavía hay más publicaciones en MongoDB,
            intentamos traer otra para completar el feed.
          */
          this.loadMorePosts();
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