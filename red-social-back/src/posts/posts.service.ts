/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { Model, Types } from 'mongoose';
import { StatisticsQueryDto } from '../auth/dto/statistics-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserProfile } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { Post, PostComment, PostDocument } from './schemas/post.schema';
import { CreateCommentDto } from '../auth/dto/create-comment.dto';
import { ListCommentsQueryDto } from '../auth/dto/list-comments-query.dto';
import { UpdateCommentDto } from '../auth/dto/update-comment.dto';
import { AnalyticsService } from '../analytics/analytics.service';


export interface UploadedPostImage {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface PostResponse {
  id: string;
  authorId: string;
  authorNombre: string;
  authorApellido: string;
  authorNombreUsuario: string;
  authorImagenPerfilUrl: string;
  title: string;
  description: string;
  imageUrl: string | null;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  comments: {
    id: string;
    userId: string;
    userNombreUsuario: string;
    userImagenPerfilUrl: string;
    text: string;
    edited: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentResponse 
{
  id: string;
  userId: string;
  userNombreUsuario: string;
  userImagenPerfilUrl: string;
  text: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type StoredPostComment = PostComment & {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class PostsService 
{
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
  ) {}

    /*
    Acá obtengo una publicación específica.

    Sprint 3:
    Lo uso para mostrar la página grande de una publicación
    junto con sus comentarios.
  */
  async getPostById(postId: string): Promise<PostResponse> {
    const post = await this.findActivePostOrFail(postId);

    return this.toPostResponse(post);
  }

  /*
    Acá doy de alta una publicación.

    La publicación queda relacionada al usuario autenticado.
    La imagen es opcional.
  */
  async createPost(
    createPostDto: CreatePostDto,
    imageFile: UploadedPostImage | undefined,
    baseUrl: string,
    currentUser: AuthenticatedUser,
  ): Promise<PostResponse> {
    const author = await this.usersService.findById(currentUser.id);

    if (!author) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    let savedImage: { filePath: string; publicUrl: string } | null = null;

    if (imageFile) {
      savedImage = await this.savePostImage(imageFile, baseUrl);
    }

    try {
      const post = new this.postModel({
        authorId: author._id,
        authorNombre: author.nombre,
        authorApellido: author.apellido,
        authorNombreUsuario: author.nombreUsuario,
        authorImagenPerfilUrl: author.imagenPerfilUrl,
        title: createPostDto.title.trim(),
        description: createPostDto.description.trim(),
        imageUrl: savedImage?.publicUrl ?? null,
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        isDeleted: false,
      });

      const createdPost = await post.save();

      return this.toPostResponse(createdPost);
    } catch (error) {
      /*
        Si MongoDB falla después de guardar la imagen,
        borro la imagen para no dejar archivos huérfanos.
      */
      if (savedImage) {
        await this.deleteFileIfExists(savedImage.filePath);
      }

      throw error;
    }
  }

  /*
    Acá devuelvo el listado de publicaciones.

    Permite:
    - orderBy=fecha
    - orderBy=likes
    - userId=...
    - offset=...
    - limit=...
  */
  async listPosts(query: ListPostsQueryDto): Promise<{
    items: PostResponse[];
    total: number;
    offset: number;
    limit: number;
    orderBy: 'fecha' | 'likes';
  }> {
    const orderBy = query.orderBy ?? 'fecha';
    const offset = query.offset ?? 0;

    /*
      Acá limito a 20 para evitar traer demasiados documentos juntos.
    */
    const limit = Math.min(query.limit ?? 5, 20);

    const filter: {
      isDeleted: boolean;
      authorId?: Types.ObjectId;
    } = {
      isDeleted: false,
    };

    if (query.userId) {
      if (!Types.ObjectId.isValid(query.userId)) {
        throw new BadRequestException('El userId no es válido.');
      }

      filter.authorId = new Types.ObjectId(query.userId);
    }

    const sort: Record<string, 1 | -1> =
        orderBy === 'likes'
            ? { likesCount: -1, createdAt: -1 }
            : { createdAt: -1 };

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      items: posts.map((post) => this.toPostResponse(post)),
      total,
      offset,
      limit,
      orderBy,
    };
  }

  /*
    Acá hago baja lógica de una publicación.

    Solo puede hacerla:
    - el usuario que creó la publicación;
    - o un administrador.
  */
  async softDeletePost(
    postId: string,
    currentUser: AuthenticatedUser,
  ): Promise<PostResponse> {
    const post = await this.findActivePostOrFail(postId);

    const isOwner = String(post.authorId) === currentUser.id;
    const isAdmin = currentUser.perfil === UserProfile.Administrador;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Solo podés eliminar tus propias publicaciones.',
      );
    }

    post.isDeleted = true;

    const updatedPost = await post.save();

    return this.toPostResponse(updatedPost);
  }

  /*
    Acá doy me gusta.

    Mantengo un solo like por usuario en cada publicación.
  */
  async likePost(
    postId: string,
    currentUser: AuthenticatedUser,
  ): Promise<PostResponse> {
    const post = await this.findActivePostOrFail(postId);

    const alreadyLiked = post.likes.some(
      (userId) => String(userId) === currentUser.id,
    );

    if (alreadyLiked) {
      throw new BadRequestException(
        'Ya le diste me gusta a esta publicación.',
      );
    }

    post.likes.push(new Types.ObjectId(currentUser.id));
    post.likesCount = post.likes.length;

    const updatedPost = await post.save();

    const user = await this.usersService.findById(currentUser.id);

    if (user) 
    {
      await this.analyticsService.recordLikeGiven(
        this.usersService.toUserResponse(user),
        {
          id: String(updatedPost._id),
          title: updatedPost.title,
        },
      );
    }

    return this.toPostResponse(updatedPost);
  }

  /*
    Acá quito me gusta.

    Solo lo permito si previamente el usuario había dado like.
  */
  async unlikePost(
    postId: string,
    currentUser: AuthenticatedUser,
  ): Promise<PostResponse> {
    const post = await this.findActivePostOrFail(postId);

    const alreadyLiked = post.likes.some(
      (userId) => String(userId) === currentUser.id,
    );

    if (!alreadyLiked) {
      throw new BadRequestException(
        'No podés quitar un me gusta que no habías realizado.',
      );
    }

    post.likes = post.likes.filter(
      (userId) => String(userId) !== currentUser.id,
    );

    post.likesCount = post.likes.length;

    const updatedPost = await post.save();

    return this.toPostResponse(updatedPost);
  }

  /*
  Acá agrego un comentario a una publicación.

  Sprint 3:
  Por POST agrego un comentario junto con:
  - usuario que lo realizó;
  - fecha;
  - publicación relacionada.
*/
  async addComment(
    postId: string,
    createCommentDto: CreateCommentDto,
    currentUser: AuthenticatedUser,
  ): Promise<CommentResponse> {
    const post = await this.findActivePostOrFail(postId);

    const user = await this.usersService.findById(currentUser.id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    post.comments.push({
      userId: new Types.ObjectId(currentUser.id),
      userNombreUsuario: user.nombreUsuario,
      userImagenPerfilUrl: user.imagenPerfilUrl,
      text: createCommentDto.text.trim(),
      edited: false,
    } as unknown as PostComment);

    post.commentsCount = post.comments.length;

    const updatedPost = await post.save();

    const comments = updatedPost.comments as unknown as StoredPostComment[];
    const createdComment = comments[comments.length - 1];

    return this.toCommentResponse(createdComment);
  }

  /*
    Acá listo comentarios de una publicación.

    Sprint 3:
    - Pagino resultados.
    - Ordeno los más recientes primero.
  */
  async listComments(
    postId: string,
    query: ListCommentsQueryDto,
  ): Promise<{
    items: CommentResponse[];
    total: number;
    offset: number;
    limit: number;
  }> {
    const post = await this.findActivePostOrFail(postId);

    const offset = query.offset ?? 0;
    const limit = Math.min(query.limit ?? 5, 20);

    const comments = [...(post.comments as unknown as StoredPostComment[])];

    comments.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    });

    const paginatedComments = comments.slice(offset, offset + limit);

    return {
      items: paginatedComments.map((comment) =>
        this.toCommentResponse(comment),
      ),
      total: comments.length,
      offset,
      limit,
    };
  }

  /*
    Acá modifico un comentario.

    Sprint 3:
    El usuario que escribió el comentario puede editarlo.
    Y marco cuando quedó editado.
  */
  async updateComment(
    postId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    currentUser: AuthenticatedUser,
  ): Promise<CommentResponse> {
    const post = await this.findActivePostOrFail(postId);

    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('El id del comentario no es válido.');
    }

    const comments = post.comments as unknown as StoredPostComment[];

    const comment = comments.find(
      (item) => String(item._id) === commentId,
    );

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado.');
    }

    const isCommentOwner = String(comment.userId) === currentUser.id;

    if (!isCommentOwner) {
      throw new ForbiddenException(
        'Solo podés editar tus propios comentarios.',
      );
    }

    comment.text = updateCommentDto.text.trim();
    comment.edited = true;
    comment.updatedAt = new Date();

    post.markModified('comments');

    await post.save();

    return this.toCommentResponse(comment);
  }

    /*
    Estadística 1:
    Acá calculo la cantidad de publicaciones por usuario
    en un lapso de tiempo.
  */
  async getPostsByUserStats(query: StatisticsQueryDto): Promise<
    {
      userId: string;
      nombreUsuario: string;
      nombreCompleto: string;
      totalPublicaciones: number;
    }[]
  > {
    const { fromDate, toDate } = this.getDateRange(query);

    const results = await this.postModel
      .aggregate<{
        _id: Types.ObjectId;
        nombreUsuario: string;
        nombre: string;
        apellido: string;
        totalPublicaciones: number;
      }>([
        {
          $match: {
            isDeleted: false,
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: '$authorId',
            nombreUsuario: { $first: '$authorNombreUsuario' },
            nombre: { $first: '$authorNombre' },
            apellido: { $first: '$authorApellido' },
            totalPublicaciones: { $sum: 1 },
          },
        },
        {
          $sort: {
            totalPublicaciones: -1,
          },
        },
      ])
      .exec();

    return results.map((item) => ({
      userId: String(item._id),
      nombreUsuario: item.nombreUsuario,
      nombreCompleto: `${item.nombre} ${item.apellido}`,
      totalPublicaciones: item.totalPublicaciones,
    }));
  }

  /*
    Estadística 2:
    Acá calculo la cantidad de comentarios en un lapso de tiempo.

    La devuelvo agrupada por día para poder graficarla como línea o barras.
  */
  async getCommentsByDayStats(query: StatisticsQueryDto): Promise<
    {
      date: string;
      totalComentarios: number;
    }[]
  > {
    const { fromDate, toDate } = this.getDateRange(query);

    const results = await this.postModel
      .aggregate<{
        _id: string;
        totalComentarios: number;
      }>([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $unwind: '$comments',
        },
        {
          $match: {
            'comments.createdAt': {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$comments.createdAt',
              },
            },
            totalComentarios: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .exec();

    return results.map((item) => ({
      date: item._id,
      totalComentarios: item.totalComentarios,
    }));
  }

  /*
    Estadística 3:
    Acá calculo la cantidad de comentarios en cada publicación
    en un lapso de tiempo.
  */
  async getCommentsByPostStats(query: StatisticsQueryDto): Promise<
    {
      postId: string;
      title: string;
      authorNombreUsuario: string;
      totalComentarios: number;
    }[]
  > {
    const { fromDate, toDate } = this.getDateRange(query);

    const results = await this.postModel
      .aggregate<{
        _id: Types.ObjectId;
        title: string;
        authorNombreUsuario: string;
        totalComentarios: number;
      }>([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $unwind: '$comments',
        },
        {
          $match: {
            'comments.createdAt': {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: '$_id',
            title: { $first: '$title' },
            authorNombreUsuario: { $first: '$authorNombreUsuario' },
            totalComentarios: { $sum: 1 },
          },
        },
        {
          $sort: {
            totalComentarios: -1,
          },
        },
      ])
      .exec();

    return results.map((item) => ({
      postId: String(item._id),
      title: item.title,
      authorNombreUsuario: item.authorNombreUsuario,
      totalComentarios: item.totalComentarios,
    }));
  }

  private async findActivePostOrFail(postId: string): Promise<PostDocument> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('El id de la publicación no es válido.');
    }

    const post = await this.postModel
      .findOne({
        _id: postId,
        isDeleted: false,
      })
      .exec();

    if (!post) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    return post;
  }

  private async savePostImage(
    imageFile: UploadedPostImage,
    baseUrl: string,
  ): Promise<{ filePath: string; publicUrl: string }> {
    const uploadFolder = join(process.cwd(), 'uploads', 'posts');

    await mkdir(uploadFolder, { recursive: true });

    const fileExtension = extname(imageFile.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;

    const filePath = join(uploadFolder, fileName);

    await writeFile(filePath, imageFile.buffer);

    const publicUrl = `${baseUrl}/uploads/posts/${fileName}`;

    return {
      filePath,
      publicUrl,
    };
  }

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch {
      /*
        Si el archivo no existe, no corto la ejecución.
      */
    }
  }

  /*
    Acá obtengo el rango de fechas para estadísticas.

    Si no se envía from/to:
    - usa últimos 30 días por defecto.

    Así permito que el frontend siempre pueda pedir estadísticas,
    y también elegir un lapso concreto.
  */
  private getDateRange(query: StatisticsQueryDto): {
    fromDate: Date;
    toDate: Date;
  } {
    const now = new Date();

    const defaultFromDate = new Date();
    defaultFromDate.setDate(now.getDate() - 30);

    const fromDate = query.from ? new Date(query.from) : defaultFromDate;
    const toDate = query.to ? new Date(query.to) : now;

    /*
      Acá ajusto el final del día para que "to=2026-01-01"
      incluya todo ese día.
    */
    toDate.setHours(23, 59, 59, 999);

    return {
      fromDate,
      toDate,
    };
  }

  private toCommentResponse(comment: StoredPostComment): CommentResponse 
  {
    const fallbackDate = new Date();

    return {
      id: String(comment._id),
      userId: String(comment.userId),
      userNombreUsuario: comment.userNombreUsuario,
      userImagenPerfilUrl: comment.userImagenPerfilUrl,
      text: comment.text,
      edited: comment.edited,
      createdAt: comment.createdAt ?? fallbackDate,
      updatedAt: comment.updatedAt ?? comment.createdAt ?? fallbackDate,
    };
  }

  private toPostResponse(post: PostDocument): PostResponse {
    const comments = (post.comments ?? []) as Array<
      PostComment & {
        _id?: Types.ObjectId;
      }
    >;

    return {
      id: String(post._id),
      authorId: String(post.authorId),
      authorNombre: post.authorNombre,
      authorApellido: post.authorApellido,
      authorNombreUsuario: post.authorNombreUsuario,
      authorImagenPerfilUrl: post.authorImagenPerfilUrl,
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      likes: post.likes.map((userId) => String(userId)),
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      comments: comments.map((comment) => ({
        id: String(comment._id),
        userId: String(comment.userId),
        userNombreUsuario: comment.userNombreUsuario,
        userImagenPerfilUrl: comment.userImagenPerfilUrl,
        text: comment.text,
        edited: comment.edited,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      isDeleted: post.isDeleted,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}