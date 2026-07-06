/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { User } from '../../users/schemas/user.schema';

export type PostDocument = HydratedDocument<Post>;

/*
  Comentario embebido dentro de una publicación.

  Lo dejamos preparado desde ahora porque Sprint 2 pide que
  Mi Perfil muestre las últimas 3 publicaciones y sus comentarios.
*/
@Schema({ _id: true, timestamps: true })
export class PostComment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  userNombreUsuario!: string;

  @Prop({ required: true })
  userImagenPerfilUrl!: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  text!: string;

  @Prop({ required: true, default: false })
  edited!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

@Schema({ collection: 'posts', timestamps: true })
export class Post {
  /*
    Usuario creador de la publicación.
  */
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  authorId!: Types.ObjectId;

  /*
    Datos del autor duplicados para mostrar rápido en el feed
    sin tener que hacer populate todo el tiempo.
  */
  @Prop({ required: true, trim: true })
  authorNombre!: string;

  @Prop({ required: true, trim: true })
  authorApellido!: string;

  @Prop({ required: true, trim: true })
  authorNombreUsuario!: string;

  @Prop({ required: true })
  authorImagenPerfilUrl!: string;

  /*
    Datos propios de la publicación.
  */
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 100 })
  title!: string; 

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 1000 })
  description!: string;

  /*
    Imagen opcional de la publicación.
    Si no se sube imagen, queda null.

    Como el tipo TypeScript es string | null,
    Mongoose necesita que le indiquemos explícitamente
    que el tipo real en MongoDB es String.
  */
  @Prop({ type: String, default: null })
  imageUrl!: string | null;

  /*
    Likes.
    Guardamos los IDs de los usuarios que dieron me gusta.
  */
  @Prop({
    type: [{ type: Types.ObjectId, ref: User.name }],
    default: [],
  })
  likes!: Types.ObjectId[];

  /*
    Campo numérico para poder ordenar fácil por cantidad de likes.
  */
  @Prop({ required: true, default: 0 })
  likesCount!: number;

  /*
    Comentarios embebidos.
  */
  @Prop({ type: [PostCommentSchema], default: [] })
  comments!: PostComment[];

  @Prop({ required: true, default: 0 })
  commentsCount!: number;

  /*
    Baja lógica.
    No borramos físicamente el documento.
  */
  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);