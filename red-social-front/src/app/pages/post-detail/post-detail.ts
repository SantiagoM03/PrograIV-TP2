import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { Post, PostComment } from '../../models/post';
import { AuthService } from '../../services/auth';
import { PostsService } from '../../services/posts';

@Component({
  selector: 'app-post-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  post: Post | null = null;
  comments: PostComment[] = [];

  postId = '';

  commentsOffset = 0;
  commentsLimit = 5;
  commentsTotal = 0;

  isLoadingPost = false;
  isLoadingComments = false;
  isAddingComment = false;
  editingCommentId: string | null = null;

  pageError = '';
  commentError = '';

  commentForm = this.fb.group({
    text: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(500),
      ],
    ],
  });

  editCommentForm = this.fb.group({
    text: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(500),
      ],
    ],
  });

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.postId) {
      this.pageError = 'No se encontró la publicación solicitada.';
      return;
    }

    this.loadPost();
    this.loadInitialComments();
  }

  get text() {
    return this.commentForm.get('text');
  }

  get editText() {
    return this.editCommentForm.get('text');
  }

  get canLoadMoreComments(): boolean {
    return this.comments.length < this.commentsTotal;
  }

  loadPost(): void {
    this.pageError = '';
    this.isLoadingPost = true;

    this.postsService
      .getPostById(this.postId)
      .pipe(
        finalize(() => {
          this.isLoadingPost = false;
        }),
      )
      .subscribe({
        next: (post) => {
          this.post = post;
        },
        error: (error: Error) => {
          this.pageError = error.message;
        },
      });
  }

  loadInitialComments(): void {
    this.comments = [];
    this.commentsOffset = 0;
    this.commentsTotal = 0;
    this.loadMoreComments();
  }

  loadMoreComments(): void {
    this.commentError = '';
    this.isLoadingComments = true;

    this.postsService
      .listComments(this.postId, this.commentsOffset, this.commentsLimit)
      .pipe(
        finalize(() => {
          this.isLoadingComments = false;
        }),
      )
      .subscribe({
        next: (response) => {
          /*
            No borro los comentarios anteriores.
            Agrego los nuevos debajo, como pide el Sprint 3.
          */
          this.comments = [...this.comments, ...response.items];
          this.commentsOffset = this.comments.length;
          this.commentsTotal = response.total;
        },
        error: (error: Error) => {
          this.commentError = error.message;
        },
      });
  }

  addComment(): void 
  {
    this.commentError = '';

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const formValue = this.commentForm.getRawValue();

    this.isAddingComment = true;

    this.postsService
      .addComment(this.postId, {
        text: formValue.text!.trim(),
      })
      .pipe(
        finalize(() => {
          this.isAddingComment = false;
        }),
      )
      .subscribe({
        next: (createdComment) => {
          /*
            Sprint 3 pide que en la primera carga llegue una cantidad limitada
            y que el resto se traiga con "Cargar más".

            Por eso, cuando agrego un comentario nuevo, lo pongo arriba,
            pero mantengo visible solamente commentsLimit comentarios.
          */
          this.comments = [createdComment, ...this.comments].slice(
            0,
            this.commentsLimit,
          );

          /*
            Aumento el total real de comentarios.
            Si total > comments.length, entonces aparece "Cargar más comentarios".
          */
          this.commentsTotal = this.commentsTotal + 1;

          /*
            Como ahora la lista visible puede seguir teniendo 5 comentarios,
            el próximo offset me tiene que coincidir con los comentarios visibles.
          */
          this.commentsOffset = this.comments.length;

          if (this.post) {
            this.post = {
              ...this.post,
              commentsCount: this.post.commentsCount + 1,
            };
          }

          this.commentForm.reset();
        },
        error: (error: Error) => {
          this.commentError = error.message;
        },
      });
  }

  startEditComment(comment: PostComment): void {
    this.editingCommentId = comment.id;
    this.editCommentForm.setValue({
      text: comment.text,
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentForm.reset();
  }

  saveEditedComment(comment: PostComment): void {
    this.commentError = '';

    if (this.editCommentForm.invalid) {
      this.editCommentForm.markAllAsTouched();
      return;
    }

    const formValue = this.editCommentForm.getRawValue();

    this.postsService
      .updateComment(this.postId, comment.id, {
        text: formValue.text!.trim(),
      })
      .subscribe({
        next: (updatedComment) => {
          this.comments = this.comments.map((item) =>
            item.id === updatedComment.id ? updatedComment : item,
          );

          this.cancelEditComment();
        },
        error: (error: Error) => {
          this.commentError = error.message;
        },
      });
  }

  canEditComment(comment: PostComment): boolean {
    return this.currentUser()?.id === comment.userId;
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}