/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';

import { AnalyticsService } from '../analytics/analytics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtCookieGuard } from '../auth/guards/jwt-cookie.guard';
import * as authenticatedUserInterface from '../auth/interfaces/authenticated-user.interface';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

/*
  Sprint 5:
  Acá manejo el perfil público de usuario.

  Permito que un usuario pueda clickear el nombre o foto
  de otro usuario para ver:
  - sus datos;
  - sus últimas 3 publicaciones.
*/
@Controller('profiles')
@UseGuards(JwtCookieGuard)
export class ProfilesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Param('id') id: string,
    @CurrentUser() currentUser: authenticatedUserInterface.AuthenticatedUser,
  ) {
    // Acá busco al dueño del perfil y valido que exista y esté habilitado.
    const profileOwner = await this.usersService.findById(id);

    if (!profileOwner || !profileOwner.habilitado) {
      throw new NotFoundException('Perfil no encontrado.');
    }

    // Acá registro la visita solo si tengo identificado al usuario que visita.
    const currentUserDocument = await this.usersService.findById(
      currentUser.id,
    );

    if (currentUserDocument) {
      await this.analyticsService.recordProfileVisit(
        this.usersService.toUserResponse(currentUserDocument),
        this.usersService.toUserResponse(profileOwner),
      );
    }

    // Acá pido las últimas 3 publicaciones para mostrarlas en el perfil.
    const latestPosts = await this.postsService.listPosts({
      userId: id,
      orderBy: 'fecha',
      offset: 0,
      limit: 3,
    });

    return {
      user: this.usersService.toUserResponse(profileOwner),
      latestPosts: latestPosts.items,
    };
  }
}