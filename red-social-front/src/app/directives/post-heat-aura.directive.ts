import {
  Directive,
  HostBinding,
  Input,
  OnChanges,
} from '@angular/core';

import { Post } from '../models/post';

/*
  Directiva propia Sprint 4.

  Aplica un aura visual a la publicación según su actividad:
  likes + comentarios + antigüedad.

  La idea es que el usuario pueda detectar visualmente
  qué publicaciones tienen más movimiento social.
*/
@Directive({
  selector: '[appPostHeatAura]',
  standalone: true,
})
export class PostHeatAuraDirective implements OnChanges {
  @Input() appPostHeatAura: Post | null = null;

  @HostBinding('style.borderColor')
  borderColor = 'rgba(255, 255, 255, 0.12)';

  @HostBinding('style.boxShadow')
  boxShadow = '';

  @HostBinding('style.transition')
  transition = 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease';

  ngOnChanges(): void {
    const post = this.appPostHeatAura;

    if (!post) {
      this.applyLowAura();
      return;
    }

    const createdAt = new Date(post.createdAt);
    const now = new Date();

    const ageInHours = Number.isNaN(createdAt.getTime())
      ? 999
      : Math.max(1, (now.getTime() - createdAt.getTime()) / 1000 / 60 / 60);

    const socialScore = post.likesCount * 2 + post.commentsCount * 3;

    const freshnessBoost =
      ageInHours <= 24
        ? 1.5
        : ageInHours <= 72
          ? 1.15
          : 1;

    const heatScore = socialScore * freshnessBoost;

    if (heatScore >= 18) {
      this.applyHotAura();
      return;
    }

    if (heatScore >= 9) {
      this.applyGrowingAura();
      return;
    }

    if (heatScore >= 3) {
      this.applyMediumAura();
      return;
    }

    this.applyLowAura();
  }

  private applyHotAura(): void {
    this.borderColor = 'rgba(248, 113, 113, 0.62)';
    this.boxShadow =
      '0 22px 70px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(248, 113, 113, 0.22)';
  }

  private applyGrowingAura(): void {
    this.borderColor = 'rgba(45, 212, 191, 0.55)';
    this.boxShadow =
      '0 20px 64px rgba(6, 182, 212, 0.22), 0 0 0 1px rgba(45, 212, 191, 0.18)';
  }

  private applyMediumAura(): void {
    this.borderColor = 'rgba(167, 139, 250, 0.5)';
    this.boxShadow =
      '0 18px 54px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(167, 139, 250, 0.16)';
  }

  private applyLowAura(): void {
    this.borderColor = 'rgba(255, 255, 255, 0.12)';
    this.boxShadow = '';
  }
}