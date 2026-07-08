import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';

import {
  CommentsByDayStat,
  CommentsByPostStat,
  PostsByUserStat,
  StatisticsService,
} from '../../services/statistics';

@Component({
  selector: 'app-dashboard-statistics',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-statistics.html',
  styleUrl: './dashboard-statistics.scss',
})
export class DashboardStatistics implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly statisticsService = inject(StatisticsService);

  postsByUser: PostsByUserStat[] = [];
  commentsByDay: CommentsByDayStat[] = [];
  commentsByPost: CommentsByPostStat[] = [];

  isLoading = false;
  pageError = '';

  readonly chartColors = [
    '#7c3aed',
    '#06b6d4',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#84cc16',
    '#14b8a6',
    '#f97316',
    '#6366f1',
  ];

  readonly chartWidth = 700;
  readonly chartHeight = 260;
  readonly chartPadding = 34;

  rangeForm = this.fb.group({
    from: [this.getDefaultFromDate(), [Validators.required]],
    to: [this.getTodayDate(), [Validators.required]],
  });

  ngOnInit(): void {
    this.loadStatistics();
  }

  get from() {
    return this.rangeForm.get('from');
  }

  get to() {
    return this.rangeForm.get('to');
  }

  get totalPublicaciones(): number {
    return this.postsByUser.reduce(
      (total, item) => total + item.totalPublicaciones,
      0,
    );
  }

  get totalComentariosPorDia(): number {
    return this.commentsByDay.reduce(
      (total, item) => total + item.totalComentarios,
      0,
    );
  }

  get totalComentariosPorPost(): number {
    return this.commentsByPost.reduce(
      (total, item) => total + item.totalComentarios,
      0,
    );
  }

  get maxPostsByUser(): number {
    return Math.max(
      1,
      ...this.postsByUser.map((item) => item.totalPublicaciones),
    );
  }

  get maxCommentsByDay(): number {
    return Math.max(
      1,
      ...this.commentsByDay.map((item) => item.totalComentarios),
    );
  }

  get commentsLinePoints(): string {
    if (this.commentsByDay.length === 0) {
      return '';
    }

    return this.commentsByDay
      .map((item, index) => {
        const x = this.getLineX(index);
        const y = this.getLineY(item.totalComentarios);

        return `${x},${y}`;
      })
      .join(' ');
  }

  get commentsByPostPieGradient(): string {
    const total = this.totalComentariosPorPost;

    if (total === 0) {
      return 'conic-gradient(rgba(148, 163, 184, 0.25) 0deg 360deg)';
    }

    let currentDegree = 0;

    const segments = this.commentsByPost.map((item, index) => {
      const degrees = (item.totalComentarios / total) * 360;
      const start = currentDegree;
      const end = currentDegree + degrees;

      currentDegree = end;

      const color = this.chartColors[index % this.chartColors.length];

      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }

  loadStatistics(): void {
    this.pageError = '';

    if (this.rangeForm.invalid) {
      this.rangeForm.markAllAsTouched();
      return;
    }

    const formValue = this.rangeForm.getRawValue();

    const from = formValue.from!;
    const to = formValue.to!;

    if (from > to) {
      this.pageError = 'La fecha desde no puede ser mayor que la fecha hasta.';
      return;
    }

    this.isLoading = true;

    forkJoin({
      postsByUser: this.statisticsService.getPostsByUser({ from, to }),
      commentsByDay: this.statisticsService.getCommentsByDay({ from, to }),
      commentsByPost: this.statisticsService.getCommentsByPost({ from, to }),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.postsByUser = response.postsByUser;
          this.commentsByDay = response.commentsByDay;
          this.commentsByPost = response.commentsByPost;
        },
        error: (error: Error) => {
          this.pageError = error.message;
        },
      });
  }

  getPostBarHeight(totalPublicaciones: number): number {
    return Math.max(8, (totalPublicaciones / this.maxPostsByUser) * 180);
  }

  getLineX(index: number): number {
    if (this.commentsByDay.length === 1) {
      return this.chartWidth / 2;
    }

    const availableWidth = this.chartWidth - this.chartPadding * 2;
    const step = availableWidth / (this.commentsByDay.length - 1);

    return this.chartPadding + step * index;
  }

  getLineY(totalComentarios: number): number {
    const availableHeight = this.chartHeight - this.chartPadding * 2;
    const percentage = totalComentarios / this.maxCommentsByDay;

    return this.chartHeight - this.chartPadding - availableHeight * percentage;
  }

  getPieLegendColor(index: number): string {
    return this.chartColors[index % this.chartColors.length];
  }

  formatShortDate(dateValue: string): string {
    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  }

  private getTodayDate(): string {
    const today = new Date();

    return this.formatInputDate(today);
  }

  private getDefaultFromDate(): string {
    const date = new Date();

    date.setDate(date.getDate() - 30);

    return this.formatInputDate(date);
  }

  private formatInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}