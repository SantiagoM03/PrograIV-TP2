/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtCookieGuard } from '../auth/guards/jwt-cookie.guard';
import * as authenticatedUserInterface from '../auth/interfaces/authenticated-user.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostsService, UploadedPostImage } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /*
    Acá doy de alta una publicación.

    Recibe multipart/form-data:
    - title
    - description
    - imagen opcional

    La publicación queda asociada al usuario autenticado.
  */
  @Post()
  @UseGuards(JwtCookieGuard)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: {
        fileSize: 4 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const isImage = file.mimetype.startsWith('image/');

        if (!isImage) {
          return callback(
            new BadRequestException(
              'El archivo seleccionado debe ser una imagen.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: UploadedPostImage | undefined,
    @CurrentUser() currentUser: authenticatedUserInterface.AuthenticatedUser,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const post = await this.postsService.createPost(
      createPostDto,
      file,
      baseUrl,
      currentUser,
    );

    return {
      message: 'Publicación creada correctamente.',
      post,
    };
  }

  /*
    Acá devuelvo el listado de publicaciones.

    Ejemplos:
    GET /api/posts
    GET /api/posts?orderBy=fecha&offset=0&limit=5
    GET /api/posts?orderBy=likes&offset=0&limit=5
    GET /api/posts?userId=...
  */
  @Get()
  @HttpCode(HttpStatus.OK)
  listPosts(@Query() query: ListPostsQueryDto) {
    return this.postsService.listPosts(query);
  }

  /*
  Acá obtengo una publicación específica.

    GET /api/posts/:id
  */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);

    return {
      post,
    };
  }

  /*
    Acá hago baja lógica.

    Solo puede eliminar:
    - el dueño de la publicación;
    - o un administrador.
  */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async softDeletePost(
    @Param('id') id: string,
    @CurrentUser() currentUser: authenticatedUserInterface.AuthenticatedUser,
  ) {
    const post = await this.postsService.softDeletePost(id, currentUser);

    return {
      message: 'Publicación eliminada correctamente.',
      post,
    };
  }

  /*
    Acá agrego un me gusta.
  */
  @Post(':id/likes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async likePost(
    @Param('id') id: string,
    @CurrentUser() currentUser: authenticatedUserInterface.AuthenticatedUser,
  ) {
    const post = await this.postsService.likePost(id, currentUser);

    return {
      message: 'Me gusta agregado correctamente.',
      post,
    };
  }

  /*
    Acá quito un me gusta.
  */
  @Delete(':id/likes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCookieGuard)
  async unlikePost(
    @Param('id') id: string,
    @CurrentUser() currentUser: authenticatedUserInterface.AuthenticatedUser,
  ) {
    const post = await this.postsService.unlikePost(id, currentUser);

    return {
      message: 'Me gusta eliminado correctamente.',
      post,
    };
  }
}