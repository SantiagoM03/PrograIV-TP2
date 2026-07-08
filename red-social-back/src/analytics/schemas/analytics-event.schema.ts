/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AnalyticsEventDocument = HydratedDocument<AnalyticsEvent>;

export enum AnalyticsEventType {
  Login = 'login',
  ProfileVisit = 'profile_visit',
  LikeGiven = 'like_given',
}

@Schema({
  collection: 'analytics_events',
  timestamps: true,
})
export class AnalyticsEvent {
  @Prop({
    required: true,
    enum: AnalyticsEventType,
  })
  type!: AnalyticsEventType;

  /*
    Acá guardo el usuario que realizó la acción.
    Ejemplo:
    - quien hizo login;
    - quien visitó un perfil;
    - quien dio like.
  */
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  actorUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  actorNombreUsuario!: string;

  @Prop({ required: true, trim: true })
  actorNombreCompleto!: string;

  /*
    Acá guardo el usuario destino, si aplica.
    Ejemplo:
    - dueño del perfil visitado.
  */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  targetUserId!: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  targetNombreUsuario!: string | null;

  @Prop({ type: String, default: null })
  targetNombreCompleto!: string | null;

  /*
    Acá guardo la publicación relacionada, si aplica.
    Ejemplo:
    - publicación a la que se le dio like.
  */
  @Prop({ type: Types.ObjectId, ref: 'Post', default: null })
  postId!: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  postTitle!: string | null;
}

export const AnalyticsEventSchema =
  SchemaFactory.createForClass(AnalyticsEvent);