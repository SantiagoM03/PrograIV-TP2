import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import { PostHeatAuraDirective } from '../../directives/post-heat-aura.directive';
import { ContentMoodPipe } from '../../pipes/content-mood.pipe';
import { PostHeatLabelPipe } from '../../pipes/post-heat-label.pipe';

@Component({
  selector: 'app-post-card',
  imports: [
  RouterLink,
  PostHeatAuraDirective,
  PostHeatLabelPipe,
  ContentMoodPipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard 
{
  @Input({ required: true }) post!: Post;
  @Input() currentUser: User | null = null;
  @Input() isProcessing = false;

  @Output() like = new EventEmitter<Post>();
  @Output() unlike = new EventEmitter<Post>();
  @Output() delete = new EventEmitter<Post>();

  get isOwner(): boolean {
    return this.currentUser?.id === this.post.authorId;
  }

  get isAdmin(): boolean {
    return this.currentUser?.perfil === 'administrador';
  }

  get canDelete(): boolean {
    return this.isOwner || this.isAdmin;
  }

  get userLiked(): boolean {
    if (!this.currentUser) {
      return false;
    }

    return this.post.likes.includes(this.currentUser.id);
  }

  get authorFullName(): string {
    return `${this.post.authorNombre} ${this.post.authorApellido}`;
  }

  onToggleLike(): void {
    if (this.userLiked) {
      this.unlike.emit(this.post);
      return;
    }

    this.like.emit(this.post);
  }

  onDelete(): void {
    this.delete.emit(this.post);
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