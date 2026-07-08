/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtCookieGuard } from '../auth/guards/jwt-cookie.guard';
import * as authenticatedUserInterface from '../auth/interfaces/authenticated-user.interface';
import { CreateCommentDto } from '../auth/dto/create-comment.dto';
import { ListCommentsQueryDto } from '../auth/dto/list-comments-query.dto';
import { UpdateCommentDto } from '../auth/dto/update-comment.dto';
import { PostsService } from './posts.service';

/*
  Acá manejo el controller de comentarios.

  Lo dejo dentro del módulo de publicaciones, porque los comentarios
  están asociados a una publicación concreta.
*/
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly postsService: PostsService) {}

  /*
    GET /api/posts/:postId/comments

    Acá traigo comentarios de una publicación específica.
    Permito:
    - offset
    - limit

    Orden:
    - más recientes primero.
  */
  @Get()
  @HttpCode(HttpStatus.OK)
  listComments(
    @Param('postId') postId: string,
    @Query() query: ListCommentsQueryDto,
  ) {
    return this.postsService.listComments(postId, query);
  }

  /*
    POST /api/posts/:postId/comments

    Acá agrego un comentario con el usuario autenticado.
  */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtCookieGuard)
  async addComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: authenticatedUserInterface.AuthenticatedUser,
  ) {
    const comment = await this.postsService.addComment(
      postId,
      createCommentDto,
      currentUser,
    );

    return {
      message: 'Comentario creado correctamente.',
      comment,
    };
  }

  /*
    PUT /api/posts/:postId/comments/:commentId

    Acá modifico un comentario propio.
    Marco edited/modificado en true.
  */
  @Put(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: authenticatedUserInterface.AuthenticatedUser,
  ) {
    const comment = await this.postsService.updateComment(
      postId,
      commentId,
      updateCommentDto,
      currentUser,
    );

    return {
      message: 'Comentario modificado correctamente.',
      comment,
    };
  }
}