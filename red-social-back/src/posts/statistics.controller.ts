/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtCookieGuard } from '../auth/guards/jwt-cookie.guard';
import { StatisticsQueryDto } from '../auth/dto/statistics-query.dto';
import { PostsService } from './posts.service';

/*
  Controller de estadísticas.

  Sprint 4:
  Las estadísticas son solo para administradores.
*/
@Controller('statistics')
@UseGuards(JwtCookieGuard, AdminGuard)
export class StatisticsController {
  constructor(private readonly postsService: PostsService) {}

  /*
    GET /api/statistics/posts-by-user

    Cantidad de publicaciones realizadas por cada usuario
    en un lapso de tiempo.
  */
  @Get('posts-by-user')
  @HttpCode(HttpStatus.OK)
  getPostsByUser(@Query() query: StatisticsQueryDto) {
    return this.postsService.getPostsByUserStats(query);
  }

  /*
    GET /api/statistics/comments-by-day

    Cantidad de comentarios realizados en un lapso de tiempo,
    agrupados por día.
  */
  @Get('comments-by-day')
  @HttpCode(HttpStatus.OK)
  getCommentsByDay(@Query() query: StatisticsQueryDto) {
    return this.postsService.getCommentsByDayStats(query);
  }

  /*
    GET /api/statistics/comments-by-post

    Cantidad de comentarios en cada publicación
    en un lapso de tiempo.
  */
  @Get('comments-by-post')
  @HttpCode(HttpStatus.OK)
  getCommentsByPost(@Query() query: StatisticsQueryDto) {
    return this.postsService.getCommentsByPostStats(query);
  }
}