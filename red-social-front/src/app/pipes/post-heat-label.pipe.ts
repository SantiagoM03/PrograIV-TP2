import { Pipe, PipeTransform } from '@angular/core';

import { Post } from '../models/post';

/*
  Pipe propia Sprint 4.

  Analiza una publicación combinando:
  - cantidad de likes,
  - cantidad de comentarios,
  - antigüedad de la publicación.

  Devuelve una etiqueta de actividad social.
*/
@Pipe({
  name: 'postHeatLabel',
  standalone: true,
})
export class PostHeatLabelPipe implements PipeTransform {
  transform(post: Post | null | undefined): string {
    if (!post) {
      return 'Sin actividad';
    }

    const createdAt = new Date(post.createdAt);
    const now = new Date();

    const ageInHours = Number.isNaN(createdAt.getTime())
      ? 999
      : Math.max(1, (now.getTime() - createdAt.getTime()) / 1000 / 60 / 60);

    const likesScore = post.likesCount * 2;
    const commentsScore = post.commentsCount * 3;
    const socialScore = likesScore + commentsScore;

    const freshnessBoost =
      ageInHours <= 24
        ? 1.5
        : ageInHours <= 72
          ? 1.15
          : 1;

    const heatScore = socialScore * freshnessBoost;

    if (ageInHours <= 6 && socialScore <= 2) {
      return '🌱 Publicación nueva';
    }

    if (heatScore >= 18) {
      return '🔥 Tendencia caliente';
    }

    if (heatScore >= 9) {
      return '🚀 En crecimiento';
    }

    if (heatScore >= 3) {
      return '✨ Con movimiento';
    }

    return '💤 Baja actividad';
  }
}