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
import { AnalyticsService } from '../analytics/analytics.service';

/*
  Acá manejo el controller de estadísticas.

  Sprint 4:
  Dejo estas estadísticas solo para administradores.
*/
@Controller('statistics')
@UseGuards(JwtCookieGuard, AdminGuard)
export class StatisticsController 
{
    constructor(
    private readonly postsService: PostsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /*
    GET /api/statistics/posts-by-user

    Acá devuelvo la cantidad de publicaciones realizadas por cada usuario
    en un lapso de tiempo.
  */
  @Get('posts-by-user')
  @HttpCode(HttpStatus.OK)
  getPostsByUser(@Query() query: StatisticsQueryDto) {
    return this.postsService.getPostsByUserStats(query);
  }

  /*
    GET /api/statistics/comments-by-day

    Acá devuelvo la cantidad de comentarios en un lapso de tiempo,
    agrupados por día.
  */
  @Get('comments-by-day')
  @HttpCode(HttpStatus.OK)
  getCommentsByDay(@Query() query: StatisticsQueryDto) {
    return this.postsService.getCommentsByDayStats(query);
  }

  /*
    GET /api/statistics/comments-by-post

    Acá devuelvo la cantidad de comentarios en cada publicación
    en un lapso de tiempo.
  */
  @Get('comments-by-post')
  @HttpCode(HttpStatus.OK)
  getCommentsByPost(@Query() query: StatisticsQueryDto) {
    return this.postsService.getCommentsByPostStats(query);
  }

  /*
    Sprint 5:
    Acá devuelvo la cantidad de ingresos por usuario.
  */
  @Get('logins-by-user')
  @HttpCode(HttpStatus.OK)
  getLoginsByUser(@Query() query: StatisticsQueryDto) {
    return this.analyticsService.getLoginsByUserStats(query);
  }

  /*
    Sprint 5:
    Acá devuelvo la cantidad de visitas a perfiles.

    Cuento visitas realizadas por otros usuarios,
    porque el evento no se registra cuando uno visita su propio perfil.
  */
  @Get('profile-visits')
  @HttpCode(HttpStatus.OK)
  getProfileVisits(@Query() query: StatisticsQueryDto) {
    return this.analyticsService.getProfileVisitsStats(query);
  }

  /*
    Sprint 5:
    Acá devuelvo la cantidad de me gusta otorgados por día.
  */
  @Get('likes-by-day')
  @HttpCode(HttpStatus.OK)
  getLikesByDay(@Query() query: StatisticsQueryDto) {
    return this.analyticsService.getLikesByDayStats(query);
  }
}